import { Request, Response } from "express";

const MIN_LENGTH = 4;
const MAX_LENGTH = 32;

function renderError(res: Response, error: string) {
  res.render("signup", { error });
}

export function signupController(req: Request, res: Response) {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    renderError(res, "Invalid input.");
  }

  if (!username) {
    renderError(res, "Missing username.");
    return;
  }

  if (!password) {
    renderError(res, "Missing password.");
    return;
  }

  if (username.length < MIN_LENGTH) {
    renderError(res, "Username must be at least 4 characters.");
    return;
  }

  if (username.length > MAX_LENGTH) {
    renderError(res, "Username must be at most 32 characters.");
    return;
  }

  if (password.length < MIN_LENGTH) {
    renderError(res, "Password must be at least 4 characters.");
    return;
  }

  if (password.length > MAX_LENGTH) {
    renderError(res, "Password must be at most 32 characters.");
    return;
  }

  res.send("Hello world");
}
