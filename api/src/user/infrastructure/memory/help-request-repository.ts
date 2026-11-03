import type {
  HelpRequest,
  HelpRequestRepository,
} from "../../application/ports/help-request-repository.js";

export class MemoryHelpRequestRepository implements HelpRequestRepository {
  private readonly rows: HelpRequest[] = [];

  async add(request: HelpRequest): Promise<void> {
    this.rows.push(request);
  }
}
