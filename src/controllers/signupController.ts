import { Request, Response } from "express";
import crypto from "crypto";
import bigInt from "big-integer";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

const MIN_LENGTH = 4;
const MAX_LENGTH = 32;

const S_BYTE_SIZE = 32;

function renderError(res: Response, error: string) {
  res.render("signup", { error });
}

function reverse(buf: Buffer): Buffer {
  const b = Buffer.from(buf);
  return b.reverse();
}

// SHA1 hash of username:password (both uppercase)
function hashUP(username: string, password: string): string {
  const input = `${username.toUpperCase()}:${password.toUpperCase()}`;
  const sha = crypto.createHash("sha1");
  sha.update(Buffer.from(input));
  return sha.digest("hex").toUpperCase();
}

class SRP {
  N: bigInt.BigInteger;
  g: bigInt.BigInteger;
  s: Buffer; // salt as bytes
  v: bigInt.BigInteger; // verifier

  constructor() {
    this.N = bigInt(
      "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7",
      16,
    );
    this.g = bigInt(7);
    this.s = Buffer.alloc(0);
    this.v = bigInt.zero;
  }

  // Generate random salt
  generateSalt() {
    this.s = crypto.randomBytes(S_BYTE_SIZE);
  }

  // Compute verifier given hashed "I" (username:password SHA1)
  computeVerifier(rIHex: string) {
    const rIBuf = Buffer.from(rIHex, "hex");
    const sha = crypto.createHash("sha1");
    sha.update(reverse(this.s));
    sha.update(rIBuf);
    const x = bigInt.fromArray([...reverse(sha.digest())], 256); // little-endian
    this.v = this.g.modPow(x, this.N);
  }

  // Returns salt as uppercase hex
  getSalt(): string {
    return this.s.toString("hex").toUpperCase();
  }

  // Returns verifier as uppercase hex (32 bytes)
  getVerifier(): string {
    // pad to 32 bytes if necessary
    let buf = Buffer.from(this.v.toArray(256).value);
    if (buf.length < S_BYTE_SIZE) {
      const pad = Buffer.alloc(S_BYTE_SIZE - buf.length, 0);
      buf = Buffer.concat([pad, buf]);
    }
    return buf.toString("hex").toUpperCase();
  }

  // Set salt from hex string
  setSalt(sHex: string) {
    this.s = Buffer.from(sHex, "hex");
  }

  // Set verifier from hex string
  setVerifier(vHex: string) {
    this.v = bigInt.fromArray(Array.from(Buffer.from(vHex, "hex")), 256);
  }

  // Check if verifier matches
  proofVerifier(vHex: string): boolean {
    const otherV = bigInt.fromArray(Array.from(Buffer.from(vHex, "hex")), 256);
    return this.v.equals(otherV);
  }
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
      `SELECT 1 FROM account WHERE username = ? LIMIT 1;`,
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

  const srp = new SRP();
  srp.generateSalt();
  const rIHex = hashUP(username, password);
  srp.computeVerifier(rIHex);

  const saltHex = srp.getSalt();
  const verifierHex = srp.getVerifier();

  try {
    await pool.query(`INSERT INTO account (username, s, v) VALUES (?, ?, ?)`, [
      upUsername,
      saltHex,
      verifierHex,
    ]);

    res.render("signup-success", { username });
  } catch (error) {
    console.error(error);
    renderError(res, "Something went wrong.");
  }
}
