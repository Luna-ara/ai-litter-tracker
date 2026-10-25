import { readFile } from "node:fs/promises";
import path from "node:path";
import { error } from "@/lib/http";
import { UPLOAD_DIR, UPLOAD_NAME } from "../storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!UPLOAD_NAME.test(name)) return error(404, "Not found");

  try {
    const bytes = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(bytes, {
      headers: {
        "Content-Type": CONTENT_TYPES[name.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return error(404, "Not found");
  }
}
