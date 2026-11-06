export const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

/** Errors go back to the AI as text so it can fix the input and retry. */
export async function run(fn: () => Promise<unknown>) {
  try {
    return text(await fn());
  } catch (err) {
    return { ...text(err instanceof Error ? err.message : "Something went wrong."), isError: true };
  }
}

/** Drop undefined keys so a patch only carries what the AI actually sent. */
export const defined = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
