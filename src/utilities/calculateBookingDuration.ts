import { differenceInHours, differenceInDays, parseISO } from 'date-fns'

export type BookingType = 'hourly' | 'daily' | 'overnight'

/**
 * Calculate the quantity (duration) based on booking type and dates
 * @param bookingType - Type of booking: hourly, overnight, or daily
 * @param checkIn - Check-in date/time (ISO string or Date)
 * @param checkOut - Check-out date/time (ISO string or Date), optional for overnight
 * @returns Number representing hours or days
 */
export function calculateBookingDuration(
  bookingType: BookingType,
  checkIn: string | Date,
  checkOut?: string | Date,
): number {
  const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const checkOutDate = checkOut
    ? typeof checkOut === 'string'
      ? parseISO(checkOut)
      : checkOut
    : null

  switch (bookingType) {
    case 'hourly':
      if (!checkOutDate) return 2 // Default minimum 2 hours
      const hours = differenceInHours(checkOutDate, checkInDate)
      return Math.max(hours, 2) // Minimum 2 hours

    case 'daily':
      if (!checkOutDate) return 1 // Default 1 day
      const days = differenceInDays(checkOutDate, checkInDate)
      return Math.max(days, 1) // Minimum 1 day

    case 'overnight':
      return 1 // Overnight is always 1 unit (night) logic

    default:
      return 1
  }
}
