'use client'

import Image from 'next/image'

import SiteLogoIcon from '@/components/SiteLogoIcon'
import { useSiteIdentity } from '@/hooks/useSiteIdentity'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const DEJIX_MARK_SRC = '/images/logos/dejix-mark.png'
const DEJIX_WORDMARK_SRC = '/images/logos/dejix-wordmark.png'

interface HeaderLogoProps {
  labelSuffix?: string
}

export default function HeaderLogo({ labelSuffix }: HeaderLogoProps) {
  const site = useSiteIdentity()
  const label = labelSuffix ? `${site.name} ${labelSuffix}` : site.name

  return (
    <Link
      href="/"
      aria-label={label}
      className={cn(
        `flex h-8 shrink-0 items-center gap-1.5 text-2xl font-medium text-foreground transition-opacity hover:opacity-80 md:h-10 md:gap-2`,
      )}
    >
      <SiteLogoIcon
        logoSvg={site.logoSvg}
        logoImageUrl={DEJIX_MARK_SRC}
        alt=""
        className="size-6 shrink-0 text-current md:size-8 [&_svg]:size-6 md:[&_svg]:size-8 [&_svg_*]:fill-current [&_svg_*]:stroke-current"
        imageClassName="size-6 object-contain md:size-8"
        size={32}
      />
      <Image
        src={DEJIX_WORDMARK_SRC}
        alt={label}
        width={140}
        height={30}
        className="h-5 w-auto max-w-[6.5rem] object-contain object-left md:h-7 md:max-w-[9.5rem]"
        unoptimized
        priority
      />
    </Link>
  )
}
