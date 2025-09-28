"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nf_1 = require("./routes/nf");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/nf", nf_1.nfRouter);
app.get("/", (_req, res) => {
    res.json({ message: "API rodando 🚀", docs: "/health e /api/nf" });
});
// 🚨 Importante: NÃO usar app.listen() na Vercel
exports.default = app;
