import type { CommunicationService } from "../../communication/api/communication-service.js";
import type { UserService } from "../../user/api/user-service.js";
import { SessionCache } from "../application/session-cache.js";
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

  constructor(
    otps: OtpRepository,
    sessions: SessionRepository,
    users: UserService,
    communication: CommunicationService,
  ) {
    this.requestOtp = new RequestOtp(otps, communication);
    this.verifyOtp = new VerifyOtp(otps, sessions, users);
    const cache = new SessionCache();
    this.resolveSession = new ResolveSession(sessions, users, cache);
    this.logout = new Logout(sessions, cache);
  }

  requestLoginOtp(phone: string) {
    return this.requestOtp.execute({ phone });
  }

  verifyLoginOtp(phone: string, code: string) {
    return this.verifyOtp.execute({ phone, code });
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
