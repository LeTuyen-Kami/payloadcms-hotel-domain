'use client'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { cn } from '@/utilities/cn'

import type { Header, SiteSetting } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav, HeaderNavMobile } from './Nav'
import { Phone, Mail, MapPin, Facebook } from 'lucide-react'

interface HeaderClientProps {
  data: Header
  siteSettings: SiteSetting
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, siteSettings }) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      isScrolled ? "translate-y-[-40px]" : "translate-y-0"
    )}>
      {/* Top Bar */}
      <div className={cn(
        "bg-[#1a1a1a] text-white py-2 text-[11px] uppercase tracking-wider border-b border-[#333] transition-opacity duration-300",
        isScrolled ? "opacity-0" : "opacity-100"
      )}>
        <div className="container flex justify-between items-center">
          <div className="flex gap-6">
            {siteSettings.contact?.hotline && (
              <a href={`tel:${siteSettings.contact.hotline}`} className="flex items-center hover:text-primary transition-colors group">
                <Phone className="w-3 h-3 mr-2 text-primary group-hover:scale-110 transition-transform" /> {siteSettings.contact.hotline}
              </a>
            )}
            {siteSettings.contact?.email && (
              <a href={`mailto:${siteSettings.contact.email}`} className="flex items-center hover:text-primary transition-colors group">
                <Mail className="w-3 h-3 mr-2 text-primary group-hover:scale-110 transition-transform" /> {siteSettings.contact.email}
              </a>
            )}
            {siteSettings.contact?.address && (
              <span className="flex items-center hidden md:flex">
                <MapPin className="w-3 h-3 mr-2 text-primary" /> {siteSettings.contact.address}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {siteSettings.social?.facebook && (
              <a href={siteSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1 group">
                <Facebook className="w-3 h-3 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={cn(
        "bg-white/95 backdrop-blur-md shadow-sm transition-all duration-500",
        isScrolled ? "py-2 shadow-lg" : "py-4"
      )}>
        <div className="container flex justify-between items-center">
          <Link href="/">
            {/* Use Site Logo if available, otherwise default Logo component */}
            {siteSettings.general?.logo && typeof siteSettings.general.logo !== 'string' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={siteSettings.general.logo.url || ''}
                alt={siteSettings.general.logo.alt || 'Logo'}
                className={cn("h-12 w-auto transition-all duration-500", isScrolled && "h-10")}
              />
            ) : (
              <Logo loading="eager" priority="high" className={cn("invert dark:invert-0 transition-all duration-500", isScrolled && "scale-90")} />
            )}
          </Link>
          <HeaderNav data={data} />
          <HeaderNavMobile data={data} />
        </div>
      </div>
    </header>
  )
}
