import type { SupportedLocale } from '@/i18n/locales'

import { TagRepository } from '@/lib/db/queries/tag'

type PlatformMainTagsResult = Awaited<ReturnType<typeof TagRepository.getMainTags>>

export async function loadPlatformMainTags(locale: SupportedLocale): Promise<PlatformMainTagsResult> {
  // Do not wrap another `"use cache"` here — `TagRepository.getMainTags` already
  // caches. Nesting cache scopes on the shared DB client triggers Next's
  // "stuck on shared state from the outer render scope" deadlock probe.
  const result = await TagRepository.getMainTags(locale)

  return {
    ...result,
    data: result.data ?? [],
    globalChilds: result.globalChilds ?? [],
  }
}
