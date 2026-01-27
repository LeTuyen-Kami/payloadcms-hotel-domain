import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      heroImage: true,
    },
  })

  return (
    <div className="pt-32 pb-24 bg-[#fcfaf8]">
      <PageClient />
      <div className="container mb-12 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Khám phá ngay</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">Tin tức & Sự kiện</h1>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </div>
      </div>

      <div className="container mb-12 flex justify-between items-center border-b pb-6">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container mt-16">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Tin tức & Sự kiện | Hotel Domain`,
  }
}
