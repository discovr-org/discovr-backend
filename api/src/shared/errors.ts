export class NotFoundError extends Error {
  readonly code = "not_found" as const;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  readonly code = "validation_error" as const;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  readonly code = "unauthorized" as const;
  constructor(message = "Sign in required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
