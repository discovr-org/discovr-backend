import type { CommunicationService } from "../../communication/api/communication-service.js";
import type { UserService } from "../../user/api/user-service.js";
import { SessionCache } from "../application/session-cache.js";
import { AdminAuth } from "../application/admin-auth.js";
import { CreateHandoff, ExchangeHandoff } from "../application/handoff.js";
import type { HandoffRepository } from "../application/ports/handoff-repository.js";
import { Logout } from "../application/logout.js";
import type { OtpRepository } from "../application/ports/otp-repository.js";
import type { SessionRepository } from "../application/ports/session-repository.js";
import { RequestOtp } from "../application/request-otp.js";
import { ResolveSession } from "../application/resolve-session.js";
import { VerifyOtp } from "../application/verify-otp.js";

/** Public door into auth (OTP + sessions). */
export class AuthService {
  private readonly requestOtp: RequestOtp;
  private readonly verifyOtp: VerifyOtp;
  private readonly resolveSession: ResolveSession;
  private readonly logout: Logout;
  private readonly admin: AdminAuth;
  private readonly createHandoff: CreateHandoff;
  private readonly exchangeHandoff: ExchangeHandoff;

  constructor(
    otps: OtpRepository,
    sessions: SessionRepository,
    handoffs: HandoffRepository,
    users: UserService,
    communication: CommunicationService,
    adminKey: string,
  ) {
    this.admin = new AdminAuth(adminKey);
    this.requestOtp = new RequestOtp(otps, communication);
    this.verifyOtp = new VerifyOtp(otps, sessions, users, communication);
    const cache = new SessionCache();
    this.resolveSession = new ResolveSession(sessions, users, cache);
    this.logout = new Logout(sessions, cache);
    this.createHandoff = new CreateHandoff(handoffs);
    this.exchangeHandoff = new ExchangeHandoff(handoffs, sessions, users);
  }

  requestLoginOtp(phone: string) {
    return this.requestOtp.execute({ phone });
  }

  verifyLoginOtp(phone: string, code: string) {
    return this.verifyOtp.execute({ phone, code });
  }

  /** A one-use code the signed-in person's installed app can swap for its own session. */
  async handoffCodeFor(sessionId: string) {
    return this.createHandoff.execute(await this.resolveSession.userId(sessionId));
  }

  exchangeHandoffCode(code: unknown) {
    return this.exchangeHandoff.execute(code);
  }

  adminLogin(email: unknown, password: unknown) {
    return this.admin.login(email, password);
  }

  /** Throws unless the token belongs to a signed-in admin. */
  assertAdmin(token: string | null) {
    this.admin.verify(token);
  }

  userIdFor(sessionId: string) {
    return this.resolveSession.userId(sessionId);
  }

  me(sessionId: string) {
    return this.resolveSession.execute(sessionId);
  }

  signOut(sessionId: string) {
    return this.logout.execute(sessionId);
  }
}
