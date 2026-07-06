import { afterEach, describe, expect, it, vi } from "vitest";
import { getInitialLocale, i18nProvider } from "./i18nProvider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("i18nProvider", () => {
  it("registers en, fr and el locales", () => {
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "en", name: "English" },
      { locale: "fr", name: "Français" },
      { locale: "el", name: "Ελληνικά" },
    ]);
  });

  it("translates the language key in french", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("crm.language")).toBe("Langue");
  });

  it("translates the language key in greek", async () => {
    await i18nProvider.changeLocale("el");

    expect(i18nProvider.translate("crm.language")).toBe("Γλώσσα");
  });

  it("falls back to english for unknown locales", async () => {
    await i18nProvider.changeLocale("es");

    expect(i18nProvider.translate("crm.language")).toBe("Language");
  });

  it("uses customized password reset overrides for en, fr and el", async () => {
    await i18nProvider.changeLocale("en");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );

    await i18nProvider.changeLocale("fr");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Consultez vos emails pour trouver le message de reinitialisation du mot de passe.",
    );

    await i18nProvider.changeLocale("el");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Ελέγξτε τα email σας για μήνυμα επαναφοράς κωδικού πρόσβασης.",
    );
  });

  it("translates recently added fr crm keys", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "Aucune affaire trouvée",
    );
  });

  it("translates recently added el crm keys", async () => {
    await i18nProvider.changeLocale("el");

    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "Δεν βρέθηκαν συμφωνίες",
    );
  });

  it("uses browser french locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "fr-FR",
      languages: ["fr-FR", "en-US"],
    });

    expect(getInitialLocale()).toBe("fr");
  });

  it("uses browser greek locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "el-GR",
      languages: ["el-GR", "en-US"],
    });

    expect(getInitialLocale()).toBe("el");
  });

  it("falls back to english when browser locale is unsupported", () => {
    vi.stubGlobal("navigator", {
      language: "es-ES",
      languages: ["es-ES", "pt-BR"],
    });

    expect(getInitialLocale()).toBe("en");
  });
});
