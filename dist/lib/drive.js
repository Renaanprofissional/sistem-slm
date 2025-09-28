"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drive = void 0;
exports.listFilesInFolder = listFilesInFolder;
exports.moveFile = moveFile;
const googleapis_1 = require("googleapis");
const auth = new googleapis_1.google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
exports.drive = drive;
/**
 * Lista arquivos em uma pasta do Drive
 */
async function listFilesInFolder(folderId) {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType)",
    });
    return res.data.files || [];
}
/**
 * Move um arquivo para outra pasta
 */
async function moveFile(fileId, destFolderId) {
    // Primeiro pega os parents atuais
    const file = await drive.files.get({
        fileId,
        fields: "parents",
    });
    const previousParents = file.data.parents?.join(",") ?? "";
    // Move para nova pasta
    await drive.files.update({
        fileId,
        addParents: destFolderId,
        removeParents: previousParents,
        fields: "id, parents",
    });
    return { success: true, fileId };
}
