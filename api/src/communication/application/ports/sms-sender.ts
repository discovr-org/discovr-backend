export type SendSmsInput = {
  toE164: string;
  body: string;
};

export interface SmsSender {
  send(input: SendSmsInput): Promise<void>;
}
