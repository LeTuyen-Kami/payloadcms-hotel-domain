import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RoomCard } from '@/components/RoomCard'
import type { Page } from '@/payload-types'

type RoomsBlockType = Extract<Page['layout'][number], { blockType: 'roomsBlock' }> & {
  disableInnerContainer?: boolean
}

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

  return (
    <div className="container py-12">
      {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No rooms found.</p>
      )}
    </div>
  )
}
