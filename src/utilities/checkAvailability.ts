import { Payload } from 'payload'

export const checkAvailability = async ({
  payload,
  room,
  checkIn,
  checkOut,
}: {
  payload: Payload
  room: string
  checkIn: string | Date
  checkOut: string | Date
}): Promise<boolean> => {
  try {
    // 1. Get Room Total Stock
    const roomDoc = await payload.findByID({
      collection: 'rooms',
      id: room,
    })

    if (!roomDoc) return false

    const totalStock = roomDoc.totalStock || 1

    // 2. Count overlapping bookings
    // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
    // Here: BookingStart <= RequestedEnd AND BookingEnd >= RequestedStart
    // Status must not be 'cancelled'

    // Verify dates
    if (!checkIn || !checkOut) {
      console.warn('[Availability] Missing checkIn or checkOut date')
      return false
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      console.warn('[Availability] Invalid date format', { checkIn, checkOut })
      return false
    }

    const overlappingBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            room: {
              equals: room,
            },
          },
          {
            status: {
              not_equals: 'cancelled',
            },
          },
          {
            checkIn: {
              less_than_equal: checkOutDate.toISOString(),
            },
          },
          {
            checkOut: {
              greater_than_equal: checkInDate.toISOString(),
            },
          },
        ],
      },
    })

    const bookedCount = overlappingBookings.totalDocs

    console.log(
      `[Availability] Room: ${roomDoc.title}, Stock: ${totalStock}, Booked: ${bookedCount}, Request: ${checkInDate.toISOString()} - ${checkOutDate.toISOString()}`,
    )

    return totalStock > bookedCount
  } catch (error) {
    console.error('Error checking availability:', error)
    return false // Fail safe
  }
}
