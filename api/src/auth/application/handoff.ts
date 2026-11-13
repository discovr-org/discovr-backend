import type { UserService } from "../../user/api/user-service.js";
import { UnauthorizedError, ValidationError } from "../../shared/errors.js";
import { generateSessionToken, hashSecret } from "./crypto.js";
import type { HandoffRepository } from "./ports/handoff-repository.js";
import type { SessionRepository } from "./ports/session-repository.js";

/** Long enough to add to the Home Screen and open it; short enough that a leaked address is soon dead. */
const HANDOFF_TTL_MS = 30 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class CreateHandoff {
  constructor(private readonly handoffs: HandoffRepository) {}

  async execute(userId: string, now = new Date()): Promise<{ code: string }> {
    const code = generateSessionToken();
    await this.handoffs.create({ userId, codeHash: hashSecret(code), expiresAt: new Date(now.getTime() + HANDOFF_TTL_MS) });
    return { code };
  }
}

export class ExchangeHandoff {
  constructor(
    private readonly handoffs: HandoffRepository,
    private readonly sessions: SessionRepository,
    private readonly users: UserService,
  ) {}

  /** Swaps a code for a brand new session. The code dies on first use. */
  async execute(code: unknown, now = new Date()) {
    if (typeof code !== "string" || code.length < 20 || code.length > 100) {
      throw new ValidationError("That link has expired.");
    }
    const hit = await this.handoffs.consume(hashSecret(code), now);
    if (!hit) throw new UnauthorizedError();
    const user = await this.users.getById(hit.userId);
    const sessionId = generateSessionToken();
    await this.sessions.create({
      userId: user.id,
      tokenHash: hashSecret(sessionId),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    });
    return { sessionId, user, isNewUser: !user.name };
  }
}
