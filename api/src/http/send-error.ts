import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../shared/errors.js";

export function sendApiError(
  reply: { status: (code: number) => { send: (body: unknown) => unknown } },
  err: unknown,
) {
  if (err instanceof NotFoundError) {
    return reply.status(404).send({
      error: { code: err.code, message: err.message },
    });
  }
  if (err instanceof ValidationError) {
    return reply.status(400).send({
      error: { code: err.code, message: err.message },
    });
  }
  if (err instanceof UnauthorizedError) {
    return reply.status(401).send({
      error: { code: err.code, message: err.message },
    });
  }
  if (err instanceof Error && err.message === "Slug already taken") {
    return reply.status(400).send({
      error: {
        code: "validation_error",
        message: "That slug is already taken.",
      },
    });
  }
  throw err;
}

export function readBearerToken(
  authorization: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!raw) return null;
  const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return match?.[1]?.trim() || null;
}
