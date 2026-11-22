import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "../../shared/errors.js";

// Fixed admin login for now. Only the SHA-256 of the password is kept here.
// To change it: printf %s 'new password' | shasum -a 256
export const ADMIN_EMAIL = "admin@discovr.in";
const ADMIN_PASSWORD_SHA256 = "edb8e035dffe99734c71ae83b84ee58157c019189110ae82e3acfd95b2851dfe";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const sha256 = (v: string) => createHash("sha256").update(v).digest();

/** Signs and checks admin tokens: "<expiry ms>.<hmac>". The key is the server's own secret, so tokens can't be forged from the repo. */
export class AdminAuth {
  constructor(private readonly key: string) {}

  login(email: unknown, password: unknown, now = Date.now()): { token: string; expiresAt: string } {
    const okEmail = typeof email === "string" && email.trim().toLowerCase() === ADMIN_EMAIL;
    const okPassword = typeof password === "string" && timingSafeEqual(sha256(password), Buffer.from(ADMIN_PASSWORD_SHA256, "hex"));
    if (!okEmail || !okPassword) throw new UnauthorizedError("Wrong email or password.");
    const exp = now + TOKEN_TTL_MS;
    return { token: `${exp}.${this.sign(exp)}`, expiresAt: new Date(exp).toISOString() };
  }

  /** Throws unless the token is ours and has not expired. */
  verify(token: string | null, now = Date.now()): void {
    const [exp, sig] = (token ?? "").split(".");
    const expected = this.sign(Number(exp));
    const ok =
      Number.isFinite(Number(exp)) &&
      Number(exp) > now &&
      sig !== undefined &&
      sig.length === expected.length &&
      timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) throw new UnauthorizedError("Admin sign-in required.");
  }

  private sign(exp: number): string {
    return createHmac("sha256", this.key).update(`admin.${exp}`).digest("base64url");
  }
}
