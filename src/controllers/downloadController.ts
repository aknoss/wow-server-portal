import { createReadStream } from "fs";
import { stat } from "fs/promises";
import type { Request, Response } from "express";

export async function downloadController(_req: Request, res: Response) {
  const filePath = process.env.DOWNLOAD_FILE_PATH!;

  try {
    const fileStat = await stat(filePath);
    res.setHeader("Content-Length", fileStat.size);
    res.setHeader("Content-Disposition", "attachment; filename=wow.zip");
    createReadStream(filePath).pipe(res);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log((err as NodeJS.ErrnoException).message);
      return res.status(404).json({ error: "File not found" });
    }
    return res.status(500).json({ error: "Could not access file" });
  }
}
