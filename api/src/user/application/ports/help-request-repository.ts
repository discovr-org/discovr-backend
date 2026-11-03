export const HELP_CATEGORIES = [
  "problem_with_experience",
  "host_unreachable",
  "felt_unsafe",
  "price_or_payment_issue_with_host",
  "something_else",
] as const;

export type HelpCategory = (typeof HELP_CATEGORIES)[number];

export type HelpRequest = {
  category: HelpCategory;
  message: string;
  name: string;
  phoneE164: string;
};

export interface HelpRequestRepository {
  add(request: HelpRequest): Promise<void>;
}
