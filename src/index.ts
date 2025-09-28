import "dotenv/config";
import express from "express";
import cors from "cors";
import { nfRouter } from "./routes/nf";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/nf", nfRouter);

const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
