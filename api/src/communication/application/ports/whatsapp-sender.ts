export type SendTemplateInput = {
  toE164: string;
  name: string;
  templateId: string;
  variables: string[];
  mediaUrl?: string;
};

export type DeliveryStatus = { status: "SENT" | "DELIVERED" | "READ" | "REPLIED" | "FAILED"; failedReason?: string };

export interface WhatsAppSender {
  /** Hands the message to WhatsApp. Throws with a readable reason if it is refused. */
  sendTemplate(input: SendTemplateInput): Promise<{ messageId: string }>;
  deliveryStatus(messageId: string): Promise<DeliveryStatus>;
}
