import { Request, Response } from "express";
import { pool } from "../db";
import { RowDataPacket } from "mysql2";

export async function homeController(_req: Request, res: Response) {
  let isOnline: boolean | null = null;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT 1 FROM tbccharacters.characters WHERE online = 1 LIMIT 1;",
    );
    isOnline = rows.length > 0;
  } catch (error) {
    console.error(error);
  }

  res.render("index", { isOnline });
}
