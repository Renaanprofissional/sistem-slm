"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nfRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const drive_1 = require("../lib/drive");
const upload = (0, multer_1.default)({ dest: "uploads/" });
exports.nfRouter = (0, express_1.Router)();
const SOURCE_FOLDER = process.env.DRIVE_SOURCE_FOLDER_ID;
const DEST_FOLDER = process.env.DRIVE_DEST_FOLDER_ID;
async function findFileByName(fileName) {
    const res = await drive_1.drive.files.list({
        q: `name='${fileName}' and trashed=false`,
        fields: "files(id, name, parents)",
    });
    return res.data.files?.[0];
}
async function moveFile(fileId) {
    await drive_1.drive.files.update({
        fileId,
        addParents: DEST_FOLDER,
        removeParents: SOURCE_FOLDER,
    });
}
exports.nfRouter.post("/process-sheet", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma planilha enviada" });
        }
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx_1.default.utils.sheet_to_json(sheet);
        const nfNumbers = data
            .map((row) => row["nfs"])
            .filter((v) => !!v)
            .map((v) => String(v).trim());
        const moved = [];
        const skipped = [];
        const notFound = [];
        for (const nf of nfNumbers) {
            const fileName = `${nf}.pdf`;
            const file = await findFileByName(fileName);
            if (!file) {
                notFound.push(fileName);
                continue;
            }
            // verifica se o arquivo ainda está na pasta SOURCE
            if (!file.parents?.includes(SOURCE_FOLDER)) {
                skipped.push(fileName);
                continue;
            }
            await moveFile(file.id);
            moved.push(fileName);
        }
        fs_1.default.unlinkSync(req.file.path);
        return res.json({ moved, skipped, notFound });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao processar planilha" });
    }
});
