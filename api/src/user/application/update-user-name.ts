import { NotFoundError, ValidationError } from "../../shared/errors.js";
import type { User } from "../domain/user.js";
import type { UserRepository } from "./ports/user-repository.js";

const MAX_LENGTH = 40;

export class UpdateUserName {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string, rawName: string): Promise<User> {
    const name = rawName.trim().replace(/\s+/g, " ");
    if (!name) throw new ValidationError("Add your name.");
    if (name.length > MAX_LENGTH) {
      throw new ValidationError(`Keep it under ${MAX_LENGTH} characters.`);
    }
    const user = await this.users.updateName(id, name);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }
}
