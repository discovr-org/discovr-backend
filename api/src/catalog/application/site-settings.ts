import type { SiteSettings } from "../domain/experience.js";
import type { ExperienceRepository } from "./ports/experience-repository.js";

const text = (v: unknown, max: number): string | undefined => {
  const t = typeof v === "string" ? v.trim().slice(0, max) : "";
  return t || undefined; // empty = the guest app keeps its built-in text
};

/** Only known fields survive, and links must stay on the site or be https, so a bad save can't break or hijack the page. */
export function cleanSiteSettings(value: unknown): SiteSettings {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out: SiteSettings = {};
  const tagline = text(v.tagline, 120);
  const searchPlaceholder = text(v.searchPlaceholder, 60);
  const footerPromise = text(v.footerPromise, 120);
  if (tagline) out.tagline = tagline;
  if (searchPlaceholder) out.searchPlaceholder = searchPlaceholder;
  if (footerPromise) out.footerPromise = footerPromise;
  if (Array.isArray(v.footerLinks)) {
    out.footerLinks = v.footerLinks.slice(0, 12).flatMap((raw) => {
      const l = raw as { label?: unknown; href?: unknown } | null;
      const label = text(l?.label, 40);
      const href = text(l?.href, 200);
      const ok = href && ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://"));
      return label && ok ? [{ label, href }] : [];
    });
  }
  return out;
}

/** The words and links the guest app shows everywhere. */
export class SiteSettingsStore {
  constructor(private readonly repo: ExperienceRepository) {}

  get(): Promise<SiteSettings> {
    return this.repo.getSiteSettings();
  }

  save(input: unknown): Promise<SiteSettings> {
    return this.repo.saveSiteSettings(cleanSiteSettings(input));
  }
}
