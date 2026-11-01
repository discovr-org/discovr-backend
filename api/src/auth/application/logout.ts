import { hashSecret } from "./crypto.js";
import type { SessionRepository } from "./ports/session-repository.js";

export class Logout {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(sessionId: string): Promise<{ ok: true }> {
    const token = sessionId.trim();
    if (!token) return { ok: true };
    const session = await this.sessions.findByTokenHash(
      hashSecret(token),
      new Date(),
    );
    if (session) {
      await this.sessions.revoke(session.id, new Date());
    }
    return { ok: true };
  }
}
