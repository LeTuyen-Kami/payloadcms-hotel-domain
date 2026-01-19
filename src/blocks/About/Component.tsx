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
    <div className="container py-20 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left column: Image Collage */}
        <div className="relative">
          <div className="grid grid-cols-12 gap-4">
            {/* Tall Vertical Image */}
            <div className="col-span-12 md:col-span-7">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                {verticalImg?.url && (
                  <img
                    src={verticalImg.url}
                    alt={verticalImg.alt || 'About Image 1'}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </div>

            {/* Stacked Horizontal Images */}
            <div className="col-span-12 md:col-span-5 flex flex-col gap-4 justify-center">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                {horizontalImg1?.url && (
                  <img
                    src={horizontalImg1.url}
                    alt={horizontalImg1.alt || 'About Image 2'}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                {horizontalImg2?.url && (
                  <img
                    src={horizontalImg2.url}
                    alt={horizontalImg2.alt || 'About Image 3'}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Subtle accent element - a light blue blur or similar */}
          <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Right column: Content */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-blue-600 font-bold uppercase tracking-[0.2em] text-sm">
              {title}
            </h2>
            <div className="h-1 w-20 bg-blue-600 rounded-full" />
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {description && <RichText data={description} enableGutter={false} />}
          </div>

          {enableLink && link && (
            <div className="mt-8">
              <CMSLink
                {...link}
                appearance="default"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
