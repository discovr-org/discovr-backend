import { hashSecret } from "./crypto.js";
import type { SessionRepository } from "./ports/session-repository.js";
import type { SessionCache } from "./session-cache.js";

export class Logout {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly cache: SessionCache,
  ) {}

  async execute(sessionId: string): Promise<{ ok: true }> {
    const token = sessionId.trim();
    if (!token) return { ok: true };
    const tokenHash = hashSecret(token);
    // ponytail: other instances keep a cached session up to 60 s after sign-out.
    this.cache.delete(tokenHash);
    const session = await this.sessions.findByTokenHash(tokenHash, new Date());
    if (session) {
      await this.sessions.revoke(session.id, new Date());
    }
    return { ok: true };
  }
}
