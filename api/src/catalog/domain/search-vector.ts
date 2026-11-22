/**
 * Helpers for the tsvector text form: `'beach':1B 'sunset':2A,5C 'goa'`.
 * We write lexemes as given (lowercase, no stemming), so use base-form words.
 */
const ENTRY = /'((?:[^']|'')*)'(?::[0-9A-D,]+)?/g;

export type VectorEntry = { lexeme: string; raw: string };

export function entries(vector: string): VectorEntry[] {
  return [...vector.matchAll(ENTRY)].map((m) => ({ lexeme: m[1].replace(/''/g, "'"), raw: m[0] }));
}

export const lexemes = (vector: string) => entries(vector).map((e) => e.lexeme);

/** Words from free text: lowercase, split on spaces, no empties, no duplicates. */
export const toWords = (terms: string[]) => [...new Set(terms.flatMap((t) => t.toLowerCase().split(/\s+/)).filter(Boolean))];

const quote = (w: string) => `'${w.replace(/\\/g, "\\\\").replace(/'/g, "''")}':1B`;

export function editVector(vector: string, mode: "add" | "remove" | "replace", terms: string[]): string {
  const words = toWords(terms);
  const old = mode === "replace" ? [] : entries(vector);
  const kept = mode === "remove" ? old.filter((e) => !words.includes(e.lexeme)) : old;
  const have = new Set(kept.map((e) => e.lexeme));
  const added = mode === "remove" ? [] : words.filter((w) => !have.has(w)).map(quote);
  return [...kept.map((e) => e.raw), ...added].join(" ");
}
