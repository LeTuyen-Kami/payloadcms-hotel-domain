import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { notFound } from 'next/navigation'
import { RoomCard } from '@/components/RoomCard'
import { Media } from '@/components/Media'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

interface BranchPageProps {
  params: Promise<{
    branchSlug: string
  }>
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { branchSlug } = await params
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Branch Details
  const { docs: branches } = await payload.find({
    collection: 'branches',
    where: {
      slug: {
        equals: branchSlug,
      },
    },
    limit: 1,
  })

  const currentBranch = branches[0]

  if (!currentBranch) {
    return notFound()
  }

  // 2. Fetch Rooms for this Branch
  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where: {
      branch: {
        equals: currentBranch.id,
      },
    },
    limit: 100,
  })

  return (
    <main className="min-h-screen pb-20 bg-muted/10">
      {/* Branch Hero / Header */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 z-0 opacity-50">
             {/* Placeholder or Branch specific image could go here. Using a pattern for now */}
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />
          
          <div className="container relative z-20 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-white mb-2">
              {currentBranch.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
               {currentBranch.address}
            </p>
            {currentBranch.phone && (
               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mt-4">
                  <span>Tel: {currentBranch.phone}</span>
               </div>
            )}
          </div>
      </section>

      {/* Breadcrumb / Back */}
      <div className="container py-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Quay lại trang chủ
        </Link>

        {/* Rooms Grid */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800">Danh sách phòng</h2>
                <div className="text-muted-foreground">Tìm thấy {rooms.length} phòng</div>
            </div>
            
            {rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border">
                    <p className="text-xl text-muted-foreground">Hiện tại chưa có phòng nào khả dụng tại chi nhánh này.</p>
                </div>
            )}
        </div>
      </div>
    </main>
  )
}
