# Add Greek (el) as a supported language

## Context

Atomic CRM is already bilingual (English default + French) using `ra-core`'s
`polyglotI18nProvider`. The user wants a third language, Greek (`el`), added
as a selectable option without touching the English catalog or changing the
default locale. This is additive: new files + small, isolated edits to the
provider wiring. The locale switcher UI (header dropdown + settings page
selectors) already renders dynamically from `useLocales()`, so it needs no
code changes — it will pick up Greek automatically once registered.

## How i18n works today (confirmed by reading the code)

- `src/components/atomic-crm/providers/commons/i18nProvider.ts` is the real
  provider used by the app. It merges, in order:
  `ra-language-english` (base `ra.*` admin strings, npm pkg) →
  `ra-supabase-language-english` (`ra-supabase.*` auth strings, npm pkg) →
  a small local override object → `englishCrmMessages.ts` (CRM-domain
  strings, hand-maintained, ~570 lines, nested under `resources.*` and
  `crm.*`, typed via an exported `CrmMessages` type).
  The French catalog is built as `mergeTranslations(englishCatalog, frenchMessages, raSupabaseFrenchMessages, raSupabaseFrenchMessagesOverride, frenchCrmMessages)`
  — i.e. **English is the fallback base**, French layers on top. Missing
  French keys silently fall back to English (verified in
  `i18nProvider.test.ts`, "falls back to english for unknown locales").
- `getInitialLocale()` auto-detects `fr` from the browser, else `en`.
- Locales are registered as `[{ locale: "en", name: "English" }, { locale: "fr", name: "Français" }]`.
- The switcher (`src/components/admin/locales-menu-button.tsx`) and the two
  settings-page language `<Select>`s (`ProfilePage.tsx`,
  `SettingsPageMobile.tsx`) all call `useLocales()` and render whatever is
  registered — **no changes needed there**.
- `RelativeDate.tsx` picks a `date-fns/locale` based on `locale.startsWith("fr")` for relative-date formatting ("3 days ago"). `date-fns` already ships an `el` locale (confirmed: `node_modules/date-fns/locale/el.*` exists), so this needs a matching branch for Greek.

**Key finding — no npm shortcut for the base admin strings.** An
`ra-language-greek` package exists on npm, but it's pinned at version
`3.19.10` against `ra-core: ^3.19.10` (react-admin v3), while this app runs
`ra-core: ^5.14.7` (v3→v5 renamed/restructured many `ra.*` keys). Using it
risks silently-wrong or missing translations with no easy way to verify.
There is also no `ra-supabase-language-greek` package at all. Instead of
depending on an unmaintained, version-mismatched package, I'll hand-write
the ~213-line base `ra.*` catalog and the ~20-line `ra-supabase.*` catalog
directly, mirroring the exact keys from the currently-installed
`ra-language-english`/`ra-supabase-language-english` packages (already read
in full). This guarantees 100% key coverage matching the installed
react-admin version, with zero new dependencies.

## Files to create

1. **`src/components/atomic-crm/providers/commons/greekMessages.ts`**
   Hand-written Greek translation of the base `ra.*` namespace (actions,
   boolean, page, input, message, navigation, sort, auth, notification,
   validation, saved_queries, guesser, configurable) — mirrors the full
   structure of `node_modules/ra-language-english/dist/index.js` (213
   lines), translated to Greek. Exported as `greekMessages` (default-export
   shape matching `ra-language-french`'s import usage).

2. **`src/components/atomic-crm/providers/commons/raSupabaseGreekMessages.ts`**
   Hand-written Greek translation of the ~20-key `ra-supabase.*` auth
   namespace (email, confirm_password, sign_in_with, forgot_password,
   reset_password, password_reset, missing_tokens, back_to_login,
   validation.password_mismatch, etc.), mirroring
   `ra-supabase-language-english`'s `src/index.ts`. Exported as
   `raSupabaseGreekMessages`.

3. **`src/components/atomic-crm/providers/commons/greekCrmMessages.ts`**
   Full Greek translation of the CRM-domain catalog, structurally identical
   to `englishCrmMessages.ts` / `frenchCrmMessages.ts`: all of
   `resources.{companies,contacts,deals,notes,sales,tasks,tags}.*` and
   `crm.{auth,common,changelog,activity,dashboard,header,image_editor,import,settings,theme,language,navigation,profile,validation}.*`.
   Imports `type { CrmMessages } from "./englishCrmMessages"` exactly like
   `frenchCrmMessages.ts` does, preserving pluralization (`|||| `) and
   `%{...}` interpolation placeholders unchanged. Exported as
   `greekCrmMessages`.

## Files to edit

4. **`src/components/atomic-crm/providers/commons/i18nProvider.ts`**
   - Import the three new Greek files.
   - Add a `raSupabaseGreekMessagesOverride` object for the
     `password_reset` string override (mirrors the existing en/fr override
     pattern).
   - Build `greekCatalog = mergeTranslations(englishCatalog, greekMessages, raSupabaseGreekMessages, raSupabaseGreekMessagesOverride, greekCrmMessages)`.
   - Widen `getInitialLocale`'s return type to `"en" | "fr" | "el"` and add
     an `el`-prefix browser-locale check (checked after `fr`, before the
     `en` fallback).
   - Add an `el` branch to the `polyglotI18nProvider` locale-resolver
     function, returning `greekCatalog`.
   - Append `{ locale: "el", name: "Ελληνικά" }` to the registered locales
     array.
   - **English (`englishMessages`, `englishCrmMessages`, `raSupabaseEnglishMessages`, `raSupabaseEnglishMessagesOverride`, `englishCatalog`, the `en` default) stays completely untouched** — only additive lines.

5. **`src/components/atomic-crm/misc/RelativeDate.tsx`**
   Import `el` from `date-fns/locale` alongside `enUS, fr`, and extend
   `getDateFnsLocale` to return `el` when `locale.startsWith("el")`.

6. **`src/components/atomic-crm/providers/commons/i18nProvider.test.ts`**
   Add Greek-mirrored test cases alongside the existing French ones
   (registers `el` in `getLocales()`, translates `crm.language` to Greek,
   password-reset override, a sample CRM key, browser `el` auto-detection)
   — following the existing AAA-style tests in this file exactly.

## Explicitly NOT touched

- `englishMessages`/`englishCrmMessages` content — zero edits.
- `LocalesMenuButton`, `ProfilePage.tsx`, `SettingsPageMobile.tsx` — already
  locale-agnostic, no changes needed.
- `testI18nProvider` (English-only, used by tests) — left as-is.
- No new npm dependencies.

## Verification

- `make typecheck` — the `CrmMessages` type import on `greekCrmMessages.ts`
  will catch any missing/mistyped keys vs. the English catalog shape.
- `make test` — run `i18nProvider.test.ts` (new Greek cases) plus the full
  suite to confirm nothing else regressed.
- Manual check: `make start`, open the app, use the header language
  switcher (or Settings → Language) to switch to "Ελληνικά" and confirm the
  UI renders in Greek while switching back to English/French still works
  unchanged.
