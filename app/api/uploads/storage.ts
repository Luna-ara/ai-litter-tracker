import path from "node:path";

// Photos live outside public/ because files added there after `next build` are not served.
export const UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

export const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const UPLOAD_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
