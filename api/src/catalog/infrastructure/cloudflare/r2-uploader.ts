import { randomUUID } from "node:crypto";
import { AwsClient } from "aws4fetch";
import { ValidationError } from "../../domain/errors.js";
import type {
  ImageUploader,
  UploadedImage,
} from "../../application/ports/image-uploader.js";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Public origin serving the bucket, e.g. https://media.discovr.in */
  publicBaseUrl: string;
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Cloudflare R2 adapter over its S3-compatible API. Objects land at images/<uuid>.<ext>. */
export class R2ImageUploader implements ImageUploader {
  private readonly client: AwsClient;

  constructor(private readonly config: R2Config) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: "s3",
      region: "auto",
    });
  }

  async upload(input: {
    bytes: Buffer;
    filename: string;
    contentType: string;
  }): Promise<UploadedImage> {
    const id = randomUUID();
    const key = `images/${id}.${EXT[input.contentType] ?? "jpg"}`;
    const res = await this.client.fetch(
      `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucket}/${key}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": input.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: new Uint8Array(input.bytes),
      },
    );
    if (!res.ok) {
      const detail = (await res.text()).match(/<Message>([^<]*)<\/Message>/)?.[1];
      throw new ValidationError(detail ?? `R2 upload failed (${res.status})`);
    }
    return { id, url: `${this.config.publicBaseUrl.replace(/\/$/, "")}/${key}` };
  }
}
