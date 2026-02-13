import express from "express";
import path from "path";
import { homeController } from "./controllers/homeController";
import { signupController } from "./controllers/signupController";
import { resetPasswordController } from "./controllers/resetPasswordController";
import type { Request, Response } from "express";

const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", homeController);

app.get("/signup", (_req: Request, res: Response) => {
  res.render("signup", { error: null });
});
app.post("/signup", signupController);

app.get("/reset-password", (_req: Request, res: Response) => {
  res.render("reset-password", { error: null });
});
app.post("/reset-password", resetPasswordController);

app.listen(PORT, "::", () => {
  console.log(`Server running on PORT ${PORT}`);
});
