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
    return;
  }

  if (username.includes(" ")) {
    renderError(res, "Username must not contain spaces.");
    return;
  }

  if (password.includes(" ")) {
    renderError(res, "Password must not contain spaces.");
    return;
  }

  if (newPassword.includes(" ")) {
    renderError(res, "New password must not contain spaces.");
    return;
  }

  if (confirmNewPassword.includes(" ")) {
    renderError(res, "Confirm new password must not contain spaces.");
    return;
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

  // Check if current password matches
  const { verifier } = generateSRP(username, password, user.s);
  if (verifier !== user.v) {
    renderError(res, "Current password is wrong.");
    return;
  }

  // Generate new salt and verifier
  const { salt: newSalt, verifier: newVerifier } = generateSRP(
    username,
    newPassword,
  );

  // Update account with new password
  try {
    await pool.query(
      `UPDATE tbcrealmd.account
       SET s = ?, v = ?
       WHERE username = ?`,
      [newSalt, newVerifier, upUsername],
    );

    console.log(`Password changed with success.`);
    res.render("change-password-success");
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
  }
}
