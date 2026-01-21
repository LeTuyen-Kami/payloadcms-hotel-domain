'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { NavDropdown } from './Dropdown'

import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  return (
    <nav className="flex gap-6 items-center">
      <NavDropdown />
      {navItems.map(({ link }, i) => {
        const href =
          link.type === 'reference' && typeof link.reference?.value === 'object' && link.reference.value.slug
            ? `${link.reference?.relationTo !== 'pages' ? `/${link.reference?.relationTo}` : ''}/${link.reference.value.slug}`
            : link.url

        // Exact match or subpath (but handle homepage '/' carefully)
        const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href || ''))

        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className={cn(
              "text-sm font-medium hover:text-primary transition-colors relative",
              isActive && "text-primary font-bold after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
            )}
          />
        )
      })}
    </nav>
  )
}
