export type HostApplication = {
  name: string;
  phoneE164: string;
  city: string;
  description: string;
};

export interface HostApplicationRepository {
  add(application: HostApplication): Promise<void>;
}
