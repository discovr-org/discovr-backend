/** Goa runs on India time. "Today" for ops means the day on an Indian clock, whatever the server's zone. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const todayIst = (now = new Date()): string =>
  new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

export const addDays = (day: string, n: number): string =>
  new Date(Date.parse(`${day}T00:00:00Z`) + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** The first instant of an India-time day, as an ISO string with offset. */
export const startOfDayIst = (day: string): string => `${day}T00:00:00+05:30`;
