function hasNonEmptyEnvValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

function isProductionRuntime(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== 'production') {
    return false
  }

  // Next build can evaluate modules without full runtime secrets.
  if (env.NEXT_PHASE === 'phase-production-build') {
    return false
  }

  return true
}

function hasConfiguredSiteUrl(env: NodeJS.ProcessEnv) {
  return hasNonEmptyEnvValue(env.SITE_URL) || hasNonEmptyEnvValue(env.VERCEL_PROJECT_PRODUCTION_URL)
}

/**
 * Returns critical production env vars that are missing.
 * Local/dev and production builds are intentionally skipped.
 */
export function getMissingCriticalProductionEnvVars(env: NodeJS.ProcessEnv = process.env): string[] {
  if (!isProductionRuntime(env)) {
    return []
  }

  const missing: string[] = []

  if (!hasNonEmptyEnvValue(env.POSTGRES_URL)) {
    missing.push('POSTGRES_URL')
  }

  if (!hasNonEmptyEnvValue(env.BETTER_AUTH_SECRET)) {
    missing.push('BETTER_AUTH_SECRET')
  }

  if (!hasConfiguredSiteUrl(env)) {
    missing.push('SITE_URL')
  }

  return missing
}

/**
 * Soft validation for production boot: logs clearly, throws only when STRICT_PRODUCTION_ENV=1.
 * Does not break local development or Docker/Vercel build phases.
 */
export function assertCriticalProductionEnv(env: NodeJS.ProcessEnv = process.env) {
  const missing = getMissingCriticalProductionEnvVars(env)
  if (missing.length === 0) {
    return { ok: true as const, missing }
  }

  const message = `Missing required production environment variables: ${missing.join(', ')}`
  console.error(`[production-env] ${message}`)

  const strict = env.STRICT_PRODUCTION_ENV?.trim().toLowerCase()
  if (strict === '1' || strict === 'true' || strict === 'yes' || strict === 'on') {
    throw new Error(message)
  }

  return { ok: false as const, missing }
}
