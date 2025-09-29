"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nf_1 = require("./routes/nf");
const auth_1 = require("./routes/auth"); // novo
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/nf", nf_1.nfRouter);
app.use("/api/auth", auth_1.authRouter); // rota de login
// exemplo de rota protegida
const auth_2 = require("./middleware/auth");
app.get("/api/secure", auth_2.authMiddleware, (_req, res) => {
    res.json({ secret: "Só quem tem token consegue ver isso 🚀" });
});
const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
