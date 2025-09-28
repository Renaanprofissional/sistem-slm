import { Router } from "express";
import jwt from "jsonwebtoken";

const authRouter = Router();

// Usuários fixos (4 pessoas)
const users = [
  { username: "renan", password: "@salome2025" },
  { username: "erick", password: "@salome2025" },
  { username: "bruna", password: "@salome2025" },
  { username: "caue", password: "@salome2025" },
];

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  // gera token válido por 1h
  const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: "1h" });

  res.json({ message: "Login realizado com sucesso", token });
});

export { authRouter };
