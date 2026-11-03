import { uploadImage, type ImageFile } from "./image-file.js";
import type { ImageUploader } from "./ports/image-uploader.js";

/** Upload an image for story content. The caller saves the URL into `content.blocks`. */
export class UploadContentImage {
  constructor(private readonly images: ImageUploader) {}

  async execute(file: ImageFile): Promise<{ url: string }> {
    const uploaded = await uploadImage(this.images, file, { kind: "content_image" });
    return { url: uploaded.url };
  }
}
