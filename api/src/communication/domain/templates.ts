/**
 * WhatsApp templates ops can send. Each one must already be approved in BotSpace.
 * `id` is the templateId BotSpace shows. `body` is the approved text with {{1}}, {{2}}... as in BotSpace.
 * `variables` says what fills {{1}}, {{2}}... in order, by name: firstName, lastDay, daysLeft.
 * Add a template here, deploy, and it shows up in the admin Messages page with a preview.
 *
 * Example:
 *   {
 *     id: "trip_ending_surprise",
 *     label: "Trip ending: surprise",
 *     body: "Hi {{1}}, your Goa trip ends on {{2}}. Here's a little something for your last days.",
 *     variables: ["firstName", "lastDay"],
 *   },
 */
export type MessageTemplate = {
  id: string;
  label: string;
  body: string;
  variables: string[];
  /** Image or document link for a template with a media header. */
  mediaUrl?: string;
};

export const TEMPLATES: MessageTemplate[] = [];

/** The text a person will see: {{n}} replaced by the n-th variable. */
export function renderTemplate(t: MessageTemplate, values: Record<string, string>): string {
  return t.body.replace(/\{\{(\d+)\}\}/g, (_, n) => values[t.variables[Number(n) - 1] ?? ""] ?? "");
}

/** The ordered values BotSpace wants for this template. */
export const variablesFor = (t: MessageTemplate, values: Record<string, string>): string[] =>
  t.variables.map((name) => values[name] ?? "");
