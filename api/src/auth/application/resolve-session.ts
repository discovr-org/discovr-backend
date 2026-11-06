import type { UserService } from "../../user/api/user-service.js";
import type { PresentedUser } from "../../user/infrastructure/presenters.js";
import { UnauthorizedError } from "../../shared/errors.js";
import { hashSecret } from "./crypto.js";
import type { SessionRepository } from "./ports/session-repository.js";
import type { SessionCache } from "./session-cache.js";

export class ResolveSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly users: UserService,
    private readonly cache: SessionCache,
  ) {}

  /** Just the user id. Enough for saves and other routes that don't need the profile. */
  async userId(sessionId: string): Promise<string> {
    const token = sessionId.trim();
    if (!token) throw new UnauthorizedError();
    const tokenHash = hashSecret(token);

    const cached = this.cache.get(tokenHash);
    if (cached) return cached;

    const session = await this.sessions.findByTokenHash(tokenHash, new Date());
    if (!session) throw new UnauthorizedError("Session expired. Sign in again.");
    this.cache.set(tokenHash, session.userId);
    return session.userId;
  }

  async execute(sessionId: string): Promise<PresentedUser> {
    return this.users.getById(await this.userId(sessionId));
  }
}
