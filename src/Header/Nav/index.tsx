'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { NavDropdown } from './Dropdown'

import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { Menu, X } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  return (
    <nav className="flex gap-6 items-center hidden md:flex">
      {/* <NavDropdown /> */}
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


export const HeaderNavMobile: React.FC<{ data: HeaderType }> = ({ data }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const navItems = data?.navItems || []
  const pathname = usePathname()

  // Close menu when pathname changes
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ESC key to close
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      <MobileOvelay isOpen={isOpen} setIsOpen={setIsOpen} navItems={navItems} pathname={pathname} />
    </div>
  )
}

const MobileOvelay = ({ isOpen, setIsOpen, navItems, pathname }: { isOpen: boolean, setIsOpen: (value: boolean) => void, navItems: any[], pathname: string }) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        "fixed h-screen inset-0 z-[200] transition-all duration-300 flex flex-col transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      onClick={() => setIsOpen(false)}
    >
      <div className={cn('absolute inset-0 bg-white/20 z-1 transition-all duration-300 delay-150  backdrop-blur-sm', isOpen ? 'opacity-100' : 'opacity-0')}></div>

      <div className="flex items-center justify-between relative z-10 p-4 border-b bg-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-lg font-bold">MENU</span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex flex-col p-4 gap-2 bg-white h-fit relative z-10" onClick={(e) => e.stopPropagation()}>
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
                "text-xl font-medium py-4 px-2 border-b border-slate-50 hover:text-primary transition-colors flex items-center justify-between",
                isActive && "text-primary font-bold bg-slate-50 rounded-lg px-4"
              )}
            />
          )
        })}
      </nav>
    </div>,
    document.body
  )
}