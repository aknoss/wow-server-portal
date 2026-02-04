import { Request, Response } from "express";

export function signupController(req: Request, res: Response) {
  if (!req.body.username || !req.body.password) {
    res.render("error", { message: "Username or password not provided" });
    return;
  }

  if (req.body.username.length < 4) {
    res.render("error", {
      message: "Username should have 4 or more characters",
    });
    return;
  }

  if (req.body.username.length > 32) {
    res.render("error", {
      message: "Username should have less then 33 characters",
    });
    return;
  }

  if (req.body.password.length < 4) {
    res.render("error", {
      message: "Username should have less then 33 characters",
    });
    return;
  }

  if (req.body.password.length < 32) {
    res.render("error", {
      message: "Username should have less than 33 characters",
    });
    return;
  }

  res.send("Hello world");
}
