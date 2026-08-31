const HAS_PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i
const LOCAL_HOST_PATTERN = /^(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i

function normalizeSiteUrl(value: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('SITE_URL must be a non-empty string')
  }

  const trimmed = value.trim()
  const withProtocol = HAS_PROTOCOL_PATTERN.test(trimmed)
    ? trimmed
    : `${LOCAL_HOST_PATTERN.test(trimmed) ? 'http' : 'https'}://${trimmed}`

  let parsed
  try {
    parsed = new URL(withProtocol)
  } catch {
    throw new Error(`SITE_URL is not a valid URL: "${value}"`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('SITE_URL must start with http:// or https://')
  }

  const normalizedPath = parsed.pathname.replace(/\/+$/, '')
  return `${parsed.protocol}//${parsed.host}${normalizedPath}${parsed.search}${parsed.hash}`
}

function resolveVercelDeploymentUrl(env: Readonly<Partial<NodeJS.ProcessEnv>>): string | null {
  // Prefer the stable branch alias on Preview, then the per-deployment host.
  for (const value of [env.VERCEL_BRANCH_URL, env.VERCEL_URL]) {
    if (typeof value === 'string' && value.trim()) {
      return normalizeSiteUrl(value)
    }
  }

  return null
}

export default function resolveSiteUrl(env: Readonly<Partial<NodeJS.ProcessEnv>> = process.env): string {
  if (typeof env.SITE_URL === 'string' && env.SITE_URL.trim()) {
    return normalizeSiteUrl(env.SITE_URL)
  }

  const vercelEnv = typeof env.VERCEL_ENV === 'string' ? env.VERCEL_ENV.trim() : ''

  // Preview/dev deployments must not fall back to the production host — SIWE origin
  // checks and wallet message domains require the URL the browser is actually on.
  if (vercelEnv === 'preview' || vercelEnv === 'development') {
    const previewUrl = resolveVercelDeploymentUrl(env)
    if (previewUrl) {
      return previewUrl
    }
  }

  if (typeof env.VERCEL_PROJECT_PRODUCTION_URL === 'string' && env.VERCEL_PROJECT_PRODUCTION_URL.trim()) {
    return normalizeSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL)
  }

  const vercelUrl = resolveVercelDeploymentUrl(env)
  if (vercelUrl) {
    return vercelUrl
  }

  return 'http://localhost:3000'
}
