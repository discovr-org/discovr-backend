import type { UserService } from "../../user/api/user-service.js";
import type { PresentedUser } from "../../user/infrastructure/presenters.js";
import { UnauthorizedError } from "../../shared/errors.js";
import { hashSecret } from "./crypto.js";
import type { SessionRepository } from "./ports/session-repository.js";

export class ResolveSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly users: UserService,
  ) {}

  async execute(sessionId: string): Promise<PresentedUser> {
    const token = sessionId.trim();
    if (!token) throw new UnauthorizedError();

    const session = await this.sessions.findByTokenHash(
      hashSecret(token),
      new Date(),
    );
    if (!session) throw new UnauthorizedError("Session expired. Sign in again.");

    return this.users.getById(session.userId);
  }
}
