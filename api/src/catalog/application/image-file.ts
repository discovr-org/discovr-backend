import { ValidationError } from "../domain/errors.js";
import type { ImageUploader, UploadedImage } from "./ports/image-uploader.js";

export type ImageFile = {
  bytes: Buffer;
  filename: string;
  contentType: string;
};

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;

export function assertImageFile(file: ImageFile): void {
  if (!ALLOWED.has(file.contentType)) {
    throw new ValidationError("Use a JPG, PNG, WebP, or GIF.");
  }
  if (file.bytes.byteLength === 0) throw new ValidationError("Empty file.");
  if (file.bytes.byteLength > MAX_BYTES) {
    throw new ValidationError("Image must be under 10MB.");
  }
}

export function uploadImage(
  images: ImageUploader,
  file: ImageFile,
  metadata: Record<string, string>,
): Promise<UploadedImage> {
  assertImageFile(file);
  return images.upload({ ...file, metadata });
}
