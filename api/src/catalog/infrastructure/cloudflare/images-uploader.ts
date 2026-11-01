import { ValidationError } from "../../domain/errors.js";
import type {
  ImageUploader,
  UploadedImage,
} from "../../application/ports/image-uploader.js";

type CloudflareConfig = {
  token: string;
  email?: string;
  accountId?: string;
};

type CfEnvelope<T> = {
  success: boolean;
  errors?: Array<{ message?: string; code?: number }>;
  result?: T;
};

/**
 * Cloudflare Images adapter.
 * - API tokens (cfut_/cfat_/Bearer): Authorization Bearer
 * - Global API key (cfk_): X-Auth-Email + X-Auth-Key
 */
export class CloudflareImagesUploader implements ImageUploader {
  private accountId: string | undefined;

  constructor(private readonly config: CloudflareConfig) {
    this.accountId = config.accountId;
  }

  async upload(input: {
    bytes: Buffer;
    filename: string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<UploadedImage> {
    const accountId = await this.resolveAccountId();
    const form = new FormData();
    const blob = new Blob([new Uint8Array(input.bytes)], {
      type: input.contentType || "application/octet-stream",
    });
    form.append("file", blob, input.filename || "upload.jpg");
    if (input.metadata) {
      form.append("metadata", JSON.stringify(input.metadata));
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: this.authHeaders(),
        body: form,
      },
    );
    const body = (await res.json()) as CfEnvelope<{
      id: string;
      variants?: string[];
    }>;

    if (!res.ok || !body.success || !body.result?.id) {
      const message =
        body.errors?.[0]?.message ??
        `Cloudflare Images upload failed (${res.status})`;
      throw new ValidationError(message);
    }

    const url =
      pickPublicVariant(body.result.variants) ??
      `https://imagedelivery.net/${body.result.id}/public`;

    return { id: body.result.id, url };
  }

  private authHeaders(): Record<string, string> {
    const token = this.config.token;
    if (token.startsWith("cfk_")) {
      if (!this.config.email) {
        throw new ValidationError(
          "CLOUDFLARE_EMAIL is required when CLOUDFLARE_TOKEN is a Global API Key (cfk_).",
        );
      }
      return {
        "X-Auth-Email": this.config.email,
        "X-Auth-Key": token,
      };
    }
    return { Authorization: `Bearer ${token}` };
  }

  private async resolveAccountId(): Promise<string> {
    if (this.accountId) return this.accountId;

    const res = await fetch(
      "https://api.cloudflare.com/client/v4/accounts?per_page=5",
      { headers: this.authHeaders() },
    );
    const body = (await res.json()) as CfEnvelope<Array<{ id: string }>>;
    if (!res.ok || !body.success || !body.result?.length) {
      const message =
        body.errors?.[0]?.message ??
        "Couldn't read Cloudflare accounts. Set CLOUDFLARE_ACCOUNT_ID.";
      throw new ValidationError(message);
    }
    this.accountId = body.result[0]!.id;
    return this.accountId;
  }
}

function pickPublicVariant(variants: string[] | undefined): string | undefined {
  if (!variants?.length) return undefined;
  return (
    variants.find((v) => /\/public(?:\?|$)/.test(v)) ??
    variants.find((v) => v.includes("imagedelivery.net")) ??
    variants[0]
  );
}
