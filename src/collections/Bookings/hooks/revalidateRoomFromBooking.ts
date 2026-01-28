import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'
import type { Booking, Room } from '../../../payload-types'

export const revalidateRoomFromBooking: CollectionAfterChangeHook<Booking> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const roomId = typeof doc.room === 'object' ? doc.room?.id : doc.room

    if (roomId) {
      const room = await payload.findByID({
        collection: 'rooms',
        id: roomId,
      })

      if (room && typeof room === 'object' && 'slug' in room) {
        const path = `/rooms/${room.slug}`
        payload.logger.info(`Revalidating room (from booking) at path: ${path}`)
        revalidatePath(path)
        revalidatePath('/')
      }
    }

    // If room changed in booking, revalidate old room too
    const previousRoomId =
      typeof previousDoc?.room === 'object' ? previousDoc.room?.id : previousDoc?.room
    if (previousRoomId && previousRoomId !== roomId) {
      const prevRoom = await payload.findByID({
        collection: 'rooms',
        id: previousRoomId,
      })
      if (prevRoom && typeof prevRoom === 'object' && 'slug' in prevRoom) {
        const oldPath = `/rooms/${prevRoom.slug}`
        payload.logger.info(`Revalidating old room (from booking) at path: ${oldPath}`)
        revalidatePath(oldPath)
      }
    }
  }
  return doc
}

export const revalidateRoomFromBookingDelete: CollectionAfterDeleteHook<Booking> = async ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    const roomId = typeof doc.room === 'object' ? doc.room?.id : doc.room
    if (roomId) {
      const room = await payload.findByID({
        collection: 'rooms',
        id: roomId,
      })
      if (room && typeof room === 'object' && 'slug' in room) {
        const path = `/rooms/${room.slug}`
        payload.logger.info(`Revalidating room (from booking delete) at path: ${path}`)
        revalidatePath(path)
        revalidatePath('/')
      }
    }
  }

  return doc
}
