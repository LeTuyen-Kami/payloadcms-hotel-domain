import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import { BookingBar } from '@/components/BookingBar'
import { RoomCard } from '@/components/RoomCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{
    q?: string
    branch?: string
    checkIn?: string
    checkOut?: string
    type?: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { branch, checkIn, checkOut } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  // 1. Build Room Filter
  const where: any = {}
  if (branch) {
    where.branch = { equals: branch }
  }

  // 2. Fetch Rooms
  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where,
    limit: 100, // Show all matches
  })

  // 3. Calculate Availability
  // Default to NOW if no date selected
  const checkInDate = checkIn ? new Date(checkIn) : new Date()
  // Default checkout: +2 hours if not provided (assume hourly default logic)
  const checkOutDate = checkOut
    ? new Date(checkOut)
    : new Date(checkInDate.getTime() + 2 * 60 * 60 * 1000)

  const { docs: activeBookings } = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { status: { in: ['pending', 'confirmed'] } },
        { checkIn: { less_than_equal: checkInDate } },
        { checkOut: { greater_than: checkInDate } },
        // Note: Strict overlap check: 
        // Existing Booking: [Start, End]
        // Search: [S, E]
        // Overlap if: Start < E && End > S
        // Here we are checking if *at the requested checkIn time* there is a booking.
        // But better overlap logic is:
        // booking.checkIn < search.checkOut && booking.checkOut > search.checkIn
      ]
    },
    limit: 1000,
  })

  // Refine overlap query in memory if needed, or trust the simple query.
  // The simple query above checks if request CheckIn is inside an existing booking.
  // But strictly we should check full overlap.
  // Let's do a more robust query if possible, or filter in JS.
  // Payload 'and' with compare works.

  // Robust Overlap Check in Query:
  // booking.checkIn < CheckOutDate AND booking.checkOut > CheckInDate

  const { docs: overlappingBookings } = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { status: { in: ['pending', 'confirmed'] } },
        { checkIn: { less_than: checkOutDate } },
        { checkOut: { greater_than: checkInDate } },
      ]
    },
    limit: 1000,
  })

  const bookingsCountByRoom = overlappingBookings.reduce((acc, booking) => {
    const roomId = typeof booking.room === 'object' ? booking.room.id : booking.room
    acc[roomId] = (acc[roomId] || 0) + 1
    return acc
  }, {} as Record<string, number>)


  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Search Header Area */}
      <div className="bg-slate-900 pt-32 pb-24 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="container relative z-20">
          <h1 className="text-4xl font-serif font-bold mb-4">Kết Quả Tìm Kiếm</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Tìm thấy {rooms.length} phòng phù hợp với yêu cầu của bạn
          </p>
        </div>
      </div>

      {/* Booking Bar (Repurposed for Search Filters) */}
      <div className="container relative z-30 mb-12">
        <Suspense>
          <BookingBar />
        </Suspense>
      </div>

      <div className="container">

        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => {
              const activeCount = bookingsCountByRoom[room.id] || 0
              const totalStock = typeof room.totalStock === 'number' ? room.totalStock : 1
              const isSoldOut = activeCount >= totalStock

              return <RoomCard key={room.id} room={room} isSoldOut={isSoldOut} />
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy phòng phù hợp</h3>
            <p className="text-muted-foreground">Vui lòng thử thay đổi chi nhánh hoặc thời gian tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Tìm kiếm phòng | Cloud9 Hotel`,
  }
}
