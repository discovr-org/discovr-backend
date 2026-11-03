import { ValidationError } from "../../shared/errors.js";
import { normalizePhoneE164 } from "../../shared/phone.js";
import type { HostApplicationRepository } from "./ports/host-application-repository.js";

export type HostApplicationInput = {
  name?: unknown;
  phone?: unknown;
  city?: unknown;
  description?: unknown;
};

function text(value: unknown, max: number, missing: string): string {
  const clean = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!clean) throw new ValidationError(missing);
  return clean.slice(0, max);
}

export class SubmitHostApplication {
  constructor(private readonly applications: HostApplicationRepository) {}

  async execute(input: HostApplicationInput) {
    const name = text(input.name, 80, "Add your name.");
    const phoneE164 = normalizePhoneE164(String(input.phone ?? ""));
    const city = text(input.city, 60, "Add your city.");
    const description =
      typeof input.description === "string" ? input.description.trim().slice(0, 1000) : "";
    if (!description) throw new ValidationError("Tell us what you run.");
    await this.applications.add({ name, phoneE164, city, description });
    return { ok: true as const };
  }
}
