import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE } from '@/i18n/locales'
import {
  buildTwoFactorRedirectPath,
  getLocaleFromPathname,
  localizePathname,
  stripLocalePrefix,
  withLocalePrefix,
} from '@/lib/locale-path'

describe('locale path helpers', () => {
  it('extracts locale from pathname', () => {
    expect(getLocaleFromPathname('/pt/portfolio')).toBe('pt')
    expect(getLocaleFromPathname('/portfolio')).toBe(DEFAULT_LOCALE)
  })

  it('strips locale prefix from pathname', () => {
    expect(stripLocalePrefix('/pt/2fa')).toBe('/2fa')
    expect(stripLocalePrefix('/en/2fa')).toBe('/2fa')
    expect(stripLocalePrefix('/fa/2fa')).toBe('/2fa')
    expect(stripLocalePrefix('/pt')).toBe('/')
    expect(stripLocalePrefix('/2fa')).toBe('/2fa')
  })

  it('builds locale-aware paths', () => {
    expect(withLocalePrefix('/2fa', 'pt')).toBe('/pt/2fa')
    expect(withLocalePrefix('/2fa', DEFAULT_LOCALE)).toBe('/2fa')
    expect(withLocalePrefix('/2fa', 'en')).toBe('/en/2fa')
    expect(localizePathname('/auth/reset', '/fr/settings')).toBe('/fr/auth/reset')
    expect(localizePathname('/auth/reset', '/settings')).toBe('/auth/reset')
    expect(buildTwoFactorRedirectPath('/pt', '')).toBe('/pt/2fa?next=%2Fpt')
    expect(buildTwoFactorRedirectPath('/portfolio', '?tab=open')).toBe('/2fa?next=%2Fportfolio%3Ftab%3Dopen')
  })
})
