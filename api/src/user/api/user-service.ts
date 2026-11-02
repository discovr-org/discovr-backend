import { AddSave } from "../application/add-save.js";
import { FindOrCreateUser } from "../application/find-or-create-user.js";
import { GetUser } from "../application/get-user.js";
import { ListSaves } from "../application/list-saves.js";
import type { SaveRepository } from "../application/ports/save-repository.js";
import type { UserRepository } from "../application/ports/user-repository.js";
import { RemoveSave } from "../application/remove-save.js";
import { ReplaceSaves } from "../application/replace-saves.js";
import { presentSave, presentUser } from "../infrastructure/presenters.js";

/** Public door into users + their saves. */
export class UserService {
  private readonly findOrCreateUser: FindOrCreateUser;
  private readonly getUser: GetUser;
  private readonly listSaves: ListSaves;
  private readonly replaceSaves: ReplaceSaves;
  private readonly addSave: AddSave;
  private readonly removeSave: RemoveSave;

  constructor(users: UserRepository, saves: SaveRepository) {
    this.findOrCreateUser = new FindOrCreateUser(users);
    this.getUser = new GetUser(users);
    this.listSaves = new ListSaves(saves);
    this.replaceSaves = new ReplaceSaves(saves);
    this.addSave = new AddSave(saves);
    this.removeSave = new RemoveSave(saves);
  }

  async findOrCreateByPhone(phoneE164: string) {
    const user = await this.findOrCreateUser.execute(phoneE164);
    return presentUser(user);
  }

  async getById(id: string) {
    const user = await this.getUser.execute(id);
    return presentUser(user);
  }

  async getSaves(userId: string) {
    const rows = await this.listSaves.execute(userId);
    return { slugs: rows.map((r) => r.experienceSlug), items: rows.map(presentSave) };
  }

  async syncSaves(userId: string, slugs: string[]) {
    const rows = await this.replaceSaves.execute(userId, slugs);
    return { slugs: rows.map((r) => r.experienceSlug), items: rows.map(presentSave) };
  }

  async saveExperience(userId: string, experienceSlug: string) {
    const row = await this.addSave.execute(userId, experienceSlug);
    return presentSave(row);
  }

  async unsaveExperience(userId: string, experienceSlug: string) {
    await this.removeSave.execute(userId, experienceSlug);
    return { ok: true as const };
  }
}
