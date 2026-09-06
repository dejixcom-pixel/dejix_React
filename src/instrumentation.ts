import type { Instrumentation } from 'next'

import * as Sentry from '@sentry/nextjs'

import { isNextNotFoundError } from '@/lib/errors/next-http-fallback'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertCriticalProductionEnv } = await import('@/lib/production-env')
    assertCriticalProductionEnv()
  }

  await import('../sentry.server.config')
}

export function onRequestError(
  error: Parameters<Instrumentation.onRequestError>[0],
  request: Parameters<Instrumentation.onRequestError>[1],
  context: Parameters<Instrumentation.onRequestError>[2],
) {
  if (isNextNotFoundError(error)) {
    return
  }

  Sentry.captureRequestError(error, request, context)
}
