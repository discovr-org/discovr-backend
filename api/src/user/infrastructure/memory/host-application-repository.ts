import type {
  HostApplication,
  HostApplicationRepository,
} from "../../application/ports/host-application-repository.js";

export class MemoryHostApplicationRepository implements HostApplicationRepository {
  private readonly rows: HostApplication[] = [];

  async add(application: HostApplication): Promise<void> {
    this.rows.push(application);
  }
}
