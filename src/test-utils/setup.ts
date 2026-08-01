import '@testing-library/jest-dom'

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, values?: Record<string, unknown>) => {
    if (values) {
      if ('count' in values) {
        if (key === 'total_xp') return `${values.count} Total XP`
        if (key === 'total_sports') return `${values.count} Sports`
        if (key === 'xp') return `${values.count} XP`
        if (key === 'xp_to_next_level') return `${values.count} XP to next level`
      }
      if ('level' in values && key === 'level') return `Level ${values.level}`
    }
    return key
  }),
  useLocale: () => 'en',
}))
