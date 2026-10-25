import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { apiUser } from "@/lib/auth";
import { error, json } from "@/lib/http";
import { MAX_UPLOAD_BYTES, UPLOAD_DIR, UPLOAD_TYPES } from "./storage";

// multipart/form-data with a single `file` field -> { url: "/api/uploads/<uuid>.jpg" }
export async function POST(req: Request) {
  const user = await apiUser();
  if (user instanceof Response) return user;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return error(400, "Attach a photo in the `file` field");

  const ext = UPLOAD_TYPES[file.type];
  if (!ext) return error(400, "Photos must be JPEG, PNG or WebP");
  if (file.size > MAX_UPLOAD_BYTES) return error(400, "Photos must be 8 MB or smaller");

  const name = `${crypto.randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));

  return json({ url: `/api/uploads/${name}` }, 201);
}
