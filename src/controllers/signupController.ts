import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

const MIN_LENGTH = 4;
const MAX_LENGTH = 32;

function renderError(res: Response, error: string) {
  res.render("signup", { error });
}

export async function signupController(req: Request, res: Response) {
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

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM account WHERE username = ? LIMIT 1;`,
      [username],
    );

    if (rows.length > 0) {
      renderError(res, "User already exists. Try another one.");
      return;
    }
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
    return;
  }
}
