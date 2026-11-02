/** Presentational helpers kept out of domain entities. */

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} hr${h === 1 ? "" : "s"} ${m} mins`;
}
