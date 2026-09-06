import type { ReactNode } from 'react'

import { getExtracted, setRequestLocale } from 'next-intl/server'

import type { SupportedLocale } from '@/i18n/locales'

import { PlatformLayoutFooter } from '@/app/[locale]/(platform)/(home)/_components/PlatformFooter'
import AffiliateQueryHandler from '@/app/[locale]/(platform)/_components/AffiliateQueryHandler'
import Header from '@/app/[locale]/(platform)/_components/Header'
import MobileBottomNav from '@/app/[locale]/(platform)/_components/MobileBottomNav'
import NavigationTabs from '@/app/[locale]/(platform)/_components/NavigationTabs'
import PlatformViewerState from '@/app/[locale]/(platform)/_components/PlatformViewerState'
import { FilterProvider } from '@/app/[locale]/(platform)/_providers/FilterProvider'
import PlatformNavigationProvider from '@/app/[locale]/(platform)/_providers/PlatformNavigationProvider'
import { TradingOnboardingProvider } from '@/app/[locale]/(platform)/_providers/TradingOnboardingProvider'
import { getRootLocale } from '@/i18n/root-locale'
import { loadPlatformMainTags } from '@/lib/platform-main-tags'
import { buildChildParentMap, buildPlatformNavigationTags } from '@/lib/platform-navigation'
import { shouldPrerenderPublicShell } from '@/lib/public-shell-rendering'
import { getWagmiStateCookieValue } from '@/lib/wagmi-storage.server'
import AppKitProvider from '@/providers/AppKitProvider'

export const instant = false

async function PlatformLayoutContent({ children, locale }: { children: ReactNode; locale: SupportedLocale }) {
  // Keep i18n + tag assembly outside `"use cache"`. Tags are already cached in
  // `TagRepository.getMainTags` — a surrounding cache layer nested those fills
  // and deadlocked on the shared DB client.
  const t = await getExtracted({ locale })
  const { data: mainTags, globalChilds } = await loadPlatformMainTags(locale)
  const tags = buildPlatformNavigationTags({
    mainTags: mainTags ?? [],
    globalChilds,
    trendingLabel: t('Trending'),
    newLabel: t('New'),
  })
  const childParentMap = buildChildParentMap(mainTags ?? [])

  return (
    <TradingOnboardingProvider>
      <PlatformViewerState />
      <FilterProvider>
        <PlatformNavigationProvider tags={tags} childParentMap={childParentMap}>
          <div className="min-h-screen">
            <Header />
            <NavigationTabs />
            {children}
          </div>
          <PlatformLayoutFooter />
          <MobileBottomNav />
          <AffiliateQueryHandler />
        </PlatformNavigationProvider>
      </FilterProvider>
    </TradingOnboardingProvider>
  )
}

export default async function PlatformLayout({ children }: LayoutProps<'/[locale]'>) {
  const resolvedLocale = await getRootLocale()
  const wagmiCookie = shouldPrerenderPublicShell() ? null : await getWagmiStateCookieValue()
  setRequestLocale(resolvedLocale)

  return (
    <AppKitProvider wagmiCookie={wagmiCookie}>
      <PlatformLayoutContent locale={resolvedLocale}>{children}</PlatformLayoutContent>
    </AppKitProvider>
  )
}
