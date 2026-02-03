import express from "express";
import path from "path";
import type { Request, Response } from "express";

const PORT = 3000;

const app = express();

app.use(express.static("public"));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/signup", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
