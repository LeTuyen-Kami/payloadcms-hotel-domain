import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RoomCard } from '@/components/RoomCard'
import type { Page } from '@/payload-types'

type RoomsBlockType = Extract<Page['layout'][number], { blockType: 'roomsBlock' }>


export const RoomsBlockComponent: React.FC<RoomsBlockType> = async ({ title, branch, limit }) => {
  const payload = await getPayload({ config: configPromise })

  const where: any = {}
  if (branch) {
    where.branch = { equals: typeof branch === 'object' ? branch.id : branch }
  }

  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where,
    limit: limit || 6,
  })

  // Calculate Availability
  const now = new Date()
  const { docs: activeBookings } = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { status: { in: ['pending', 'confirmed'] } },
        { checkIn: { less_than_equal: now } },
        { checkOut: { greater_than: now } },
      ]
    },
    limit: 1000,
  })

  const bookingsCountByRoom = activeBookings.reduce((acc, booking) => {
    const roomId = typeof booking.room === 'object' ? booking.room.id : booking.room
    acc[roomId] = (acc[roomId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container py-12">
      {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const activeCount = bookingsCountByRoom[room.id] || 0
            const totalStock = typeof room.totalStock === 'number' ? room.totalStock : 1
            const isSoldOut = activeCount >= totalStock

            return <RoomCard key={room.id} room={room} isSoldOut={isSoldOut} />
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No rooms found.</p>
      )}
    </div>
  )
}
