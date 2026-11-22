import type { FastifyInstance } from "fastify";
import type { AuthService } from "../auth/api/auth-service.js";
import type { CommunicationService } from "../communication/api/communication-service.js";
import type { UserService } from "../user/api/user-service.js";
import { ValidationError } from "../shared/errors.js";
import { addDays, todayIst } from "../shared/ist.js";
import { limit } from "./rate-limits.js";
import { readBearerToken, sendApiError } from "./send-error.js";

type Deps = { auth: AuthService; users: UserService; communication: CommunicationService };

/** The Messages tools (who to reach, what to send). */
export function registerAdminRoutes(app: FastifyInstance, { auth, users, communication }: Deps) {
  app.get("/v1/admin/message-templates", async () => ({ templates: communication.templates() }));

  // signedUp: today | 7d | all.  leavingWithinDays: 0..60 (last day in Goa is today or within N days).
  app.get<{ Querystring: { signedUp?: string; leavingWithinDays?: string; templateId?: string } }>(
    "/v1/admin/users",
    async (req, reply) => {
      try {
        const { signedUp = "all", leavingWithinDays, templateId } = req.query;
        const today = todayIst();
        const filter: Parameters<UserService["listForMessaging"]>[0] = {};
        if (signedUp === "today") Object.assign(filter, { signedUpFrom: today, signedUpTo: today });
        else if (signedUp === "7d") Object.assign(filter, { signedUpFrom: addDays(today, -6), signedUpTo: today });
        else if (signedUp !== "all") throw new ValidationError("signedUp must be today, 7d or all.");
        if (leavingWithinDays !== undefined) {
          const n = Number(leavingWithinDays);
          if (!Number.isInteger(n) || n < 0 || n > 60) throw new ValidationError("leavingWithinDays must be 0 to 60.");
          filter.leavingWithinDays = n;
        }
        const rows = await users.listForMessaging(filter);
        const sent = templateId ? new Set(await communication.alreadySent(templateId, rows.map((r) => r.id))) : new Set<string>();
        return reply.send({ users: rows.map((r) => ({ ...r, alreadySent: sent.has(r.id) })) });
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  app.post<{ Body: { templateId?: unknown; userIds?: unknown; allowRepeat?: unknown } }>(
    "/v1/admin/messages/send",
    limit(20),
    async (req, reply) => {
      try {
        const { templateId, userIds, allowRepeat } = req.body ?? {};
        if (typeof templateId !== "string") throw new ValidationError("Pick a template.");
        if (!Array.isArray(userIds) || !userIds.every((i) => typeof i === "string")) throw new ValidationError("Pick the people to send to.");
        const contacts = await users.contactsFor(userIds as string[]);
        const recipients = contacts.map((c) => ({ userId: c.id, name: c.name, phone: c.phone, values: c.values }));
        return reply.send(await communication.sendTemplateBatch({ templateId, recipients, allowRepeat: allowRepeat === true }));
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );

  // One batch's messages. ?refresh=1 asks BotSpace for fresh delivery status first.
  app.get<{ Params: { batchId: string }; Querystring: { refresh?: string } }>(
    "/v1/admin/messages/:batchId",
    async (req, reply) => {
      try {
        const rows = await communication.batchMessages(req.params.batchId, req.query.refresh === "1");
        return reply.send({
          messages: rows.map((r) => ({ id: r.id, userId: r.userId, templateId: r.templateId, status: r.status, failedReason: r.failedReason })),
        });
      } catch (err) {
        return sendApiError(reply, err);
      }
    },
  );
}
