export type User = {
  id: string;
  phoneE164: string;
  /** First name from sign-up. Null until the name step is finished. */
  name: string | null;
  createdAt: string;
};
