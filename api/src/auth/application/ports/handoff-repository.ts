export type CreateHandoffInput = { userId: string; codeHash: string; expiresAt: Date };

export interface HandoffRepository {
  create(input: CreateHandoffInput): Promise<void>;
  /** Uses the code up. Returns the user once; null if it is unknown, expired or already used. Must be atomic. */
  consume(codeHash: string, now: Date): Promise<{ userId: string } | null>;
}
