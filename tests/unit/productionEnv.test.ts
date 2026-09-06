import { afterEach, describe, expect, it, vi } from 'vitest'

import { assertCriticalProductionEnv, getMissingCriticalProductionEnvVars } from '@/lib/production-env'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('production env validation', () => {
  it('skips validation outside production runtime', () => {
    expect(
      getMissingCriticalProductionEnvVars({
        NODE_ENV: 'development',
      }),
    ).toEqual([])
  })

  it('skips validation during the production build phase', () => {
    expect(
      getMissingCriticalProductionEnvVars({
        NODE_ENV: 'production',
        NEXT_PHASE: 'phase-production-build',
      }),
    ).toEqual([])
  })

  it('reports missing critical production vars', () => {
    expect(
      getMissingCriticalProductionEnvVars({
        NODE_ENV: 'production',
        NEXT_PHASE: 'phase-production-server',
      }),
    ).toEqual(['POSTGRES_URL', 'BETTER_AUTH_SECRET', 'SITE_URL'])
  })

  it('accepts VERCEL_PROJECT_PRODUCTION_URL instead of SITE_URL', () => {
    expect(
      getMissingCriticalProductionEnvVars({
        NODE_ENV: 'production',
        POSTGRES_URL: 'postgres://user:pass@localhost:5432/app',
        BETTER_AUTH_SECRET: 'x'.repeat(32),
        VERCEL_PROJECT_PRODUCTION_URL: 'markets.example.com',
      }),
    ).toEqual([])
  })

  it('logs missing vars without throwing unless STRICT_PRODUCTION_ENV is set', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(
      assertCriticalProductionEnv({
        NODE_ENV: 'production',
      }),
    ).toEqual({ ok: false, missing: ['POSTGRES_URL', 'BETTER_AUTH_SECRET', 'SITE_URL'] })

    expect(errorSpy).toHaveBeenCalledOnce()

    expect(() =>
      assertCriticalProductionEnv({
        NODE_ENV: 'production',
        STRICT_PRODUCTION_ENV: '1',
      }),
    ).toThrow(/POSTGRES_URL/)
  })
})
