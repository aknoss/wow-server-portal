import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";
import { generateSRP } from "../utils/srp";
import {
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from "../utils/constants";

function renderError(res: Response, error: string) {
  res.render("change-password", { error });
}

export async function changePasswordController(req: Request, res: Response) {
  const { username, password, newPassword, confirmNewPassword } = req.body;

  if (!username) {
    renderError(res, "Missing username.");
    return;
  }

  if (!password) {
    renderError(res, "Missing password.");
    return;
  }

  if (!newPassword) {
    renderError(res, "Missing new password.");
    return;
  }

  if (!confirmNewPassword) {
    renderError(res, "Missing confirm new password.");
    return;
  }

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmNewPassword !== "string"
  ) {
    renderError(res, "Invalid input.");
  }

  if (username.includes(" ")) {
    return renderError(res, "Username must not contain spaces.");
  }

  if (password.includes(" ")) {
    return renderError(res, "Password must not contain spaces.");
  }

  if (newPassword.includes(" ")) {
    return renderError(res, "New password must not contain spaces.");
  }

  if (confirmNewPassword.includes(" ")) {
    return renderError(res, "Confirm new password must not contain spaces.");
  }

  if (password === newPassword) {
    renderError(res, "Current password and new password must be different.");
    return;
  }

  if (newPassword.length < USER_PASSWORD_MIN_LENGTH) {
    renderError(res, "New password must be at least 4 characters.");
    return;
  }

  if (newPassword.length > USER_PASSWORD_MAX_LENGTH) {
    renderError(res, "New password must be at most 32 characters.");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    renderError(res, "New password and confirm new password must match.");
    return;
  }

  const upUsername = username.toUpperCase();

  // Check if user exists
  let user: RowDataPacket | null = null;
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT username, s, v FROM tbcrealmd.account WHERE username = ? LIMIT 1;`,
      [upUsername],
    );

    if (rows.length === 0) {
      renderError(res, "User does not exist.");
      return;
    }

    user = rows[0];
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
    return;
  }
  console.log(user);
  const { salt, verifier } = generateSRP(username, password);

  // Check if password matches
}
