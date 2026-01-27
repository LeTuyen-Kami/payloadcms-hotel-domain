'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, heroImage } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // Use heroImage as preferred thumbnail, fallback to metaImage
  const imageToUse = heroImage || metaImage

  return (
    <article
      className={cn(
        'group border border-border rounded-xl overflow-hidden bg-white hover:cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-16/10 overflow-hidden">
        {!imageToUse && <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Không có hình ảnh</div>}
        {imageToUse && typeof imageToUse !== 'string' && (
          <Media
            resource={imageToUse}
            size="33vw"
            imgClassName="transition-transform duration-500 group-hover:scale-110 object-cover"
          />
        )}
      </div>
      <div className="p-6 flex flex-col grow">
        {showCategories && hasCategories && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category
                return (
                  <span key={index} className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {titleFromCategory}
                  </span>
                )
              }
              return null
            })}
          </div>
        )}
        {titleToUse && (
          <h3 className="font-serif text-xl mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            <Link className="not-prose" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4 font-light">
            {sanitizedDescription}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-primary inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            Xem thêm
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </article>
  )
}
