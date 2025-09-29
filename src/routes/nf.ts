import { Router } from "express";
import multer from "multer";
import xlsx from "xlsx";
import { drive } from "../lib/drive";
import { authMiddleware } from "../middleware/auth"; // importa o middleware

const upload = multer({ storage: multer.memoryStorage() });
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

// 🔐 agora essa rota só funciona se o usuário mandar um token válido
nfRouter.post(
  "/process-sheet",
  authMiddleware,            // <--- protege a rota
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma planilha enviada" });
      }

      // lê diretamente do buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
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

        if (!file.parents?.includes(SOURCE_FOLDER)) {
          skipped.push(fileName);
          continue;
        }

        await moveFile(file.id!);
        moved.push(fileName);
      }

      return res.json({ moved, skipped, notFound });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao processar planilha" });
    }
  }
);
