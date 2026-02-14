import express from "express";
import path from "path";
import { homeController } from "./controllers/homeController";
import { signupController } from "./controllers/signupController";
import { changePasswordController } from "./controllers/changePasswordController";
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

app.get("/change-password", (_req: Request, res: Response) => {
  res.render("change-password", { error: null });
});
app.post("/change-password", changePasswordController);

app.listen(PORT, "::", () => {
  console.log(`Server running on PORT ${PORT}`);
});
