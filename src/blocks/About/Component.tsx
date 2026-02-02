import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import type { AboutBlock as AboutBlockProps, Media } from '@/payload-types'

export const AboutBlock: React.FC<AboutBlockProps> = (props) => {
  const { title, description, images, enableLink, link } = props

  const verticalImg = images?.verticalImage as Media | undefined
  const horizontalImg1 = images?.horizontalImage1 as Media | undefined
  const horizontalImg2 = images?.horizontalImage2 as Media | undefined

  return (
    <section className="py-24 bg-slate-50 overflow-hidden relative">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left column: Image Collage (7 columns) */}
          <div className="lg:col-span-7 relative order-2 lg:order-1">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Tall Vertical Image - Staggered */}
              <div className="col-span-7 relative z-10 transition-all duration-700 hover:z-20">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20 transform hover:-translate-y-2 transition-transform duration-500">
                  {verticalImg?.url && (
                    <img
                      src={verticalImg.url}
                      alt={verticalImg.alt || 'About Image 1'}
                      className="object-cover w-full h-full transform transition-transform duration-1000 hover:scale-110"
                    />
                  )}
                  {/* Subtle glass overlay on bottom */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Stacked Horizontal Images - Offset (5 columns) */}
              <div className="col-span-5 flex flex-col gap-6 -ml-8 lg:-ml-12 relative z-20">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-500 ring-1 ring-white/10">
                  {horizontalImg1?.url && (
                    <img
                      src={horizontalImg1.url}
                      alt={horizontalImg1.alt || 'About Image 2'}
                      className="object-cover w-full h-full transform transition-transform duration-1000 hover:scale-110"
                    />
                  )}
                </div>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-500 ring-1 ring-white/10 mt-2">
                  {horizontalImg2?.url && (
                    <img
                      src={horizontalImg2.url}
                      alt={horizontalImg2.alt || 'About Image 3'}
                      className="object-cover w-full h-full transform transition-transform duration-1000 hover:scale-110"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse" />
            <div className="absolute -z-10 -bottom-20 -right-10 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl opacity-40" />

            {/* Elegant border accent */}
            <div className="absolute top-12 left-12 w-full h-full border border-primary/20 rounded-2xl -z-10 hidden lg:block" />
          </div>

          {/* Right column: Content (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8 order-1 lg:order-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-primary" />
                <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                  Câu Chuyện Của Chúng Tôi
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 leading-tight">
                {title}
              </h2>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-light">
              {description && <RichText data={description} enableGutter={false} />}
            </div>

            {enableLink && link && (
              <div className="mt-4">
                <CMSLink
                  {...link}
                  appearance="default"
                  className="inline-flex items-center justify-center bg-slate-900 text-white px-10 py-5 rounded-none font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-primary transition-all duration-500 shadow-xl hover:shadow-primary/20 group relative overflow-hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Absolute side accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none hidden xl:block">
        <span className="text-[15rem] font-serif font-black uppercase tracking-tighter rotate-90 leading-none">
          Cloud9
        </span>
      </div>
    </section>
  )
}
