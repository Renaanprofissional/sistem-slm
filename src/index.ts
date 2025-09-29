import "dotenv/config";
import express from "express";
import cors from "cors";
import { nfRouter } from "./routes/nf";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth"; // <- agora funciona

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/nf", nfRouter);
app.use("/api/auth", authRouter);

// exemplo de rota protegida
app.get("/api/secure", authMiddleware, (_req, res) => {
  res.json({ secret: "Só quem tem token consegue ver isso 🚀" });
});

const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
