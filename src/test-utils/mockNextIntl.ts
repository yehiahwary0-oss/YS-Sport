/**
 * Override the global `useTranslations` mock for a specific test.
 *
 * @example
 * ```ts
 * mockUseTranslations({
 *   'progression.title': 'My Progression',
 *   'progression.total_xp': '{count} Total XP',
 * })
 * ```
 *
 * The returned function uses `onUncalled` as a catch-all so every key
 * is handled — perfect for component tests where you only care about a
 * handful of keys.
 */
export function mockUseTranslations(
  overrides: Record<string, string>,
): (key: string) => string {
  return (key: string) => overrides[key] ?? key
}
