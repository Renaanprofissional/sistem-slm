import { Router } from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import { drive } from "../lib/drive";

const upload = multer({ dest: "uploads/" });
export const nfRouter = Router();

const SOURCE_FOLDER = process.env.DRIVE_SOURCE_FOLDER_ID!;
const DEST_FOLDER = process.env.DRIVE_DEST_FOLDER_ID!;

async function findFileByName(fileName: string) {
  const res = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: "files(id, name, parents)",
  });
  return res.data.files?.[0];
}

async function moveFile(fileId: string) {
  await drive.files.update({
    fileId,
    addParents: DEST_FOLDER,
    removeParents: SOURCE_FOLDER,
  });
}

nfRouter.post("/process-sheet", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma planilha enviada" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const nfNumbers = data
      .map((row: any) => row["nfs"])
      .filter((v) => !!v)
      .map((v) => String(v).trim());

    const moved: string[] = [];
    const skipped: string[] = [];
    const notFound: string[] = [];

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

      await moveFile(file.id!);
      moved.push(fileName);
    }

    fs.unlinkSync(req.file.path);

    return res.json({ moved, skipped, notFound });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao processar planilha" });
  }
});
