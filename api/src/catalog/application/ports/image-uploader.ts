export type UploadedImage = {
  id: string;
  url: string;
};

/** Port: object storage / CDN for catalog photos. */
export interface ImageUploader {
  upload(input: {
    bytes: Buffer;
    filename: string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<UploadedImage>;
}
