import { ValidationError } from "../../shared/errors.js";
import { normalizePhoneE164 } from "../../shared/phone.js";
import {
  HELP_CATEGORIES,
  type HelpCategory,
  type HelpRequestRepository,
} from "./ports/help-request-repository.js";

export type HelpRequestInput = {
  category?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
};

export class SubmitHelpRequest {
  constructor(private readonly requests: HelpRequestRepository) {}

  async execute(input: HelpRequestInput) {
    if (!HELP_CATEGORIES.includes(input.category as HelpCategory)) {
      throw new ValidationError("Pick what it's about.");
    }
    const message = typeof input.message === "string" ? input.message.trim().slice(0, 2000) : "";
    if (!message) throw new ValidationError("Write a message.");
    const name =
      typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ").slice(0, 80) : "";
    if (!name) throw new ValidationError("Add your name.");
    const phoneE164 = normalizePhoneE164(String(input.phone ?? ""));
    await this.requests.add({
      category: input.category as HelpCategory,
      message,
      name,
      phoneE164,
    });
    return { ok: true as const };
  }
}
