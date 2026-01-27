'use client'
import React, { useEffect, useState } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media as MediaComponent } from '@/components/Media'
import RichText from '@/components/RichText'
import { BookingBar } from '@/components/BookingBar'

export const HotelHero: React.FC<Page['hero']> = ({ links, media, images, richText }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  // Consolidate media sources: prefer 'images' array, fallback to single 'media' if array is empty (backward compatibility)
  const slides = images && images.length > 0 ? images : (media ? [{ image: media }] : [])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative text-white h-[80vh] md:h-[85vh] flex flex-col justify-end pb-16 md:pb-24">
      {/* Background Slider */}
      <div className="absolute inset-0 overflow-hidden select-none bg-black">
        {slides.map((slide, index) => {
          const slideMedia = slide.image
          if (!slideMedia || typeof slideMedia !== 'object') return null

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <MediaComponent fill imgClassName="object-cover" priority={index === 0} resource={slideMedia} />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )
        })}
      </div>

      <div className="container relative z-20 mb-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl">
          {richText && <RichText className="mb-8 prose-headings:text-3xl md:prose-headings:text-5xl prose-headings:font-serif prose-p:text-lg md:prose-p:text-xl text-shadow-lg" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} className="px-8 py-3 bg-primary hover:bg-[#b08d66] text-white font-bold uppercase tracking-widest transition-all" />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Booking Bar Overlay - aligned with the bottom area */}
      <div className="container relative z-30">
        <React.Suspense fallback={<div className="h-20 bg-white/10 animate-pulse rounded-lg" />}>
          <BookingBar />
        </React.Suspense>
      </div>
    </div>
  )
}
