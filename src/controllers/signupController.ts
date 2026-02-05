import { Request, Response } from "express";
import crypto from "crypto";
import bigInt from "big-integer";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

const MIN_LENGTH = 4;
const MAX_LENGTH = 32;

function renderError(res: Response, error: string) {
  res.render("signup", { error });
}

const N = bigInt(
  "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7",
  16,
);
const g = bigInt(7);

function sha1(buffer: Buffer) {
  return crypto.createHash("sha1").update(buffer).digest();
}

function generateVerifier(username: string, password: string, salt: Buffer) {
  const upUser = username.toUpperCase();
  const upPass = password.toUpperCase();

  const h1 = sha1(Buffer.from(`${upUser}:${upPass}`));
  const h2 = sha1(Buffer.concat([salt, h1]));

  const x = bigInt.fromArray([...h2].reverse(), 256);
  const v = g.modPow(x, N);

  return Buffer.from(v.toArray(256).value.reverse());
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

  // Check if user already exists
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

  const salt = crypto.randomBytes(32);
  const verifier = generateVerifier(username, password, salt);
  const saltHex = salt.toString("hex");
  const verifierHex = verifier.toString("hex");

  try {
    await pool.query(`INSERT INTO account (username, s, v) VALUES (?, ?, ?)`, [
      username.toUpperCase(),
      saltHex,
      verifierHex,
    ]);

    res.render("signup-success", { username });
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
  }
}
