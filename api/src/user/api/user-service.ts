import { FindOrCreateUser } from "../application/find-or-create-user.js";
import { GetUser } from "../application/get-user.js";
import type { UserRepository } from "../application/ports/user-repository.js";
import { presentUser } from "../infrastructure/presenters.js";

/** Public door into users. */
export class UserService {
  private readonly findOrCreateUser: FindOrCreateUser;
  private readonly getUser: GetUser;

  constructor(users: UserRepository) {
    this.findOrCreateUser = new FindOrCreateUser(users);
    this.getUser = new GetUser(users);
  }

  async findOrCreateByPhone(phoneE164: string) {
    const user = await this.findOrCreateUser.execute(phoneE164);
    return presentUser(user);
  }

  async getById(id: string) {
    const user = await this.getUser.execute(id);
    return presentUser(user);
  }
}
