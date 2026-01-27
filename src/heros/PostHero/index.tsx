import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative min-h-[70vh] md:min-h-[80vh] flex items-end pb-12 md:pb-24 pt-32 md:pt-40">
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={heroImage} />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="container z-10 relative text-white">
        <div className="max-w-208 mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category
                return (
                  <span key={index} className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold bg-primary text-white px-3 py-1 rounded">
                    {categoryTitle || 'Chưa phân loại'}
                  </span>
                )
              }
              return null
            })}
          </div>

          <h1 className="mb-10 text-4xl md:text-6xl lg:text-7xl font-serif leading-tight">{title}</h1>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-10 border-t border-white/20">
            {hasAuthors && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Người viết</p>
                <p className="font-medium text-lg text-white">{formatAuthors(populatedAuthors)}</p>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Thời gian</p>
                <time className="font-medium text-lg text-white" dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
