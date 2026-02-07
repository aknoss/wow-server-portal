import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { generateSRP } from "../utils/srp";

const MIN_LENGTH = 4;
const MAX_LENGTH = 32;
const TBC_EXPANSION = 1;

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

  if (username.includes(" ")) {
    return renderError(res, "Username must not contain spaces.");
  }

  if (password.includes(" ")) {
    return renderError(res, "Password must not contain spaces.");
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

  const upUsername = username.toUpperCase();

  // Check if user already exists
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM tbcrealmd.account WHERE username = ? LIMIT 1;`,
      [upUsername],
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

  const { salt, verifier } = generateSRP(username, password);

  try {
    await pool.query(
      `INSERT INTO tbcrealmd.account (username, s, v, expansion) VALUES (?, ?, ?, ?)`,
      [upUsername, salt, verifier, TBC_EXPANSION],
    );

    console.log(`Account ${username} created with success.`);
    res.render("signup-success", { username });
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
  }
}
