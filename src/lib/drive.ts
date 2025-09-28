import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Lista arquivos em uma pasta do Drive
 */
export async function listFilesInFolder(folderId: string) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
  });
  return res.data.files || [];
}

/**
 * Move um arquivo para outra pasta
 */
export async function moveFile(fileId: string, destFolderId: string) {
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

export { drive };
