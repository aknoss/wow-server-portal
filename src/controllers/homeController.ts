import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

let cachedIsOnline: boolean | null = null;
let cachedAt = 0;
const TTL = 30000; // 30s

export async function homeController(_req: Request, res: Response) {
  // Client cache of 30 seconds
  res.set("Cache-Control", "public, max-age=30");

  const now = Date.now();

  // Server cache of 30 seconds
  if (cachedIsOnline !== null && now - cachedAt < TTL) {
    res.render("index", { isOnline: cachedIsOnline });
    return;
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM tbccharacters.characters WHERE online = 1 LIMIT 1;",
    );
    cachedIsOnline = rows.length > 0;
    cachedAt = now;
  } catch (error) {
    console.error(error);
  }

  res.render("index", { isOnline: cachedIsOnline });
}
