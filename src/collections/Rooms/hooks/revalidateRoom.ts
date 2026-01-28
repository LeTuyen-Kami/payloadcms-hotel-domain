import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'
import type { Room } from '../../../payload-types'

export const revalidateRoom: CollectionAfterChangeHook<Room> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/rooms/${doc.slug}`
    payload.logger.info(`Revalidating room at path: ${path}`)
    revalidatePath(path)

    // If slug changed, revalidate old path too
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      const oldPath = `/rooms/${previousDoc.slug}`
      payload.logger.info(`Revalidating old room at path: ${oldPath}`)
      revalidatePath(oldPath)
    }

    // Also revalidate homepage as it usually shows rooms
    revalidatePath('/')
  }
  return doc
}

export const revalidateRoomDelete: CollectionAfterDeleteHook<Room> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate && doc?.slug) {
    const path = `/rooms/${doc.slug}`
    payload.logger.info(`Revalidating room at path: ${path}`)
    revalidatePath(path)
    revalidatePath('/')
  }

  return doc
}
