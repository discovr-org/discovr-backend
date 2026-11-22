import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessageLogRepository, MessageSend, NewMessageSend } from "../../application/ports/message-log-repository.js";

const COLUMNS = "id, batch_id, user_id, phone_e164, template_id, provider_message_id, status, failed_reason, created_at";

type Row = {
  id: string;
  batch_id: string;
  user_id: string;
  phone_e164: string;
  template_id: string;
  provider_message_id: string | null;
  status: string;
  failed_reason: string | null;
  created_at: string;
};

const map = (r: Row): MessageSend => ({
  id: String(r.id),
  batchId: String(r.batch_id),
  userId: String(r.user_id),
  phoneE164: String(r.phone_e164),
  templateId: String(r.template_id),
  providerMessageId: r.provider_message_id,
  status: String(r.status),
  failedReason: r.failed_reason,
  createdAt: String(r.created_at),
});

export class SupabaseMessageLogRepository implements MessageLogRepository {
  constructor(private readonly db: SupabaseClient) {}

  async add(row: NewMessageSend): Promise<MessageSend> {
    const { data, error } = await this.db
      .from("message_sends")
      .insert({
        batch_id: row.batchId,
        user_id: row.userId,
        phone_e164: row.phoneE164,
        template_id: row.templateId,
        provider_message_id: row.providerMessageId,
        status: row.status,
        failed_reason: row.failedReason,
      })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return map(data as Row);
  }

  async userIdsAlreadySent(templateId: string, userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];
    const { data, error } = await this.db
      .from("message_sends")
      .select("user_id")
      .eq("template_id", templateId)
      .neq("status", "FAILED")
      .in("user_id", userIds);
    if (error) throw error;
    return [...new Set((data ?? []).map((r) => String(r.user_id)))];
  }

  async listByBatch(batchId: string): Promise<MessageSend[]> {
    const { data, error } = await this.db.from("message_sends").select(COLUMNS).eq("batch_id", batchId).order("created_at");
    if (error) throw error;
    return (data ?? []).map((r) => map(r as Row));
  }

  async updateStatus(id: string, status: string, failedReason: string | null): Promise<void> {
    const { error } = await this.db
      .from("message_sends")
      .update({ status, failed_reason: failedReason, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }
}
