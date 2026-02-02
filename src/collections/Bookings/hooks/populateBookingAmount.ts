import type { CollectionBeforeChangeHook } from 'payload'

export const populateBookingAmount: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const isUpdate = operation === 'update'

  // 1. Construct the effective booking data by merging incoming update with existing doc
  // Use data fields if present (changes), otherwise fallback to originalDoc
  const ref = {
    checkIn: data.checkIn || originalDoc?.checkIn,
    checkOut: data.checkOut || originalDoc?.checkOut,
    room: data.room || originalDoc?.room,
    type: data.type || originalDoc?.type,
    amount: data.amount, // we typically want to overwrite this if we recalculate
  }

  // 2. Determine if we should recalculate
  // Recalculate if:
  // - It's a create operation (and we have enough info)
  // - It's an update operation AND any of the key fields (room, dates, type) changed

  const didChange =
    isUpdate &&
    ((data.checkIn && data.checkIn !== originalDoc?.checkIn) ||
      (data.checkOut && data.checkOut !== originalDoc?.checkOut) ||
      (data.room &&
        (typeof data.room === 'object' ? data.room.id : data.room) !==
          (typeof originalDoc?.room === 'object' ? originalDoc?.room?.id : originalDoc?.room)) ||
      (data.type && data.type !== originalDoc?.type))

  // If nothing relevant changed and amount exists, we can skip (unless it's a create where we assume we must calc)
  if (isUpdate && !didChange && ref.amount) {
    return data
  }

  // 3. Validation
  if (!ref.room || !ref.checkIn) {
    return data
  }

  try {
    const roomId = typeof ref.room === 'object' ? ref.room.id : ref.room
    const room = await req.payload.findByID({
      collection: 'rooms',
      id: roomId,
    })

    if (!room || !room.pricing) return data

    let calculatedPrice = 0
    const checkIn = new Date(ref.checkIn)
    // If checkOut is missing, default to 2 hours for calculation purpose?
    // Or if update and unset, we might have issues. Assuming valid dates.
    const checkOut = ref.checkOut
      ? new Date(ref.checkOut)
      : new Date(checkIn.getTime() + 2 * 60 * 60 * 1000)

    // Logic based on booking type
    if (ref.type === 'hourly') {
      const durationHours = Math.max(
        1,
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)),
      )

      const basePrice = room.pricing.priceHourlyFirst2Hours || 0
      const nextHourPrice = room.pricing.priceHourlyNextHour || 0

      if (durationHours <= 2) {
        calculatedPrice = basePrice
      } else {
        calculatedPrice = basePrice + (durationHours - 2) * nextHourPrice
      }
    } else if (ref.type === 'daily') {
      // Calculate days
      const durationDays = Math.max(
        1,
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
      )
      calculatedPrice = (room.pricing.priceDaily || 0) * durationDays
    } else if (ref.type === 'overnight') {
      calculatedPrice = room.pricing.priceOvernight || 0
    }

    // Set the calculated amount
    if (calculatedPrice > 0) {
      data.amount = calculatedPrice
    }
  } catch (error) {
    console.warn('Error calculating booking amount:', error)
  }

  return data
}
