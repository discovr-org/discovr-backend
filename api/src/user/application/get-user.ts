import { NotFoundError } from "../../shared/errors.js";
import type { User } from "../domain/user.js";
import type { UserRepository } from "./ports/user-repository.js";

export class GetUser {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }
}
