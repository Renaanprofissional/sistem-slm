import { Router } from "express";
import jwt from "jsonwebtoken";

const authRouter = Router();

// Usuários fixos (4 pessoas)
const users = [
  { username: "renan", password: "@Renan2025" },
  { username: "erick", password: "@erick2025" },
  { username: "bruna", password: "@bruna2025" },
  { username: "caue", password: "@caue2025" },
];

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username.trim() && u.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.json({ message: "Login realizado com sucesso", token });
});

export { authRouter };
