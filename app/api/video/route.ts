import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<Response> {
  // Serve the promo video in byte ranges to discourage trivial downloads
  const videoPath = path.join(process.cwd(), "public", "ad.mp4");

  if (!fs.existsSync(videoPath)) {
    return new Response("Not found", { status: 404 });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  // Common headers to discourage downloads (cannot fully prevent)
  const baseHeaders: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Disposition": "inline" // inline, not attachment
  };

  if (range) {
    // Example: bytes=start-end
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? Math.min(parseInt(parts[1], 10), fileSize - 1) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start > end) {
      return new Response("Invalid range", { status: 416 });
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(videoPath, { start, end });
    return new Response(fileStream as unknown as ReadableStream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": String(chunkSize)
      }
    });
  }

  const fileStream = fs.createReadStream(videoPath);
  return new Response(fileStream as unknown as ReadableStream, {
    headers: {
      ...baseHeaders,
      "Content-Length": String(fileSize)
    }
  });
}


