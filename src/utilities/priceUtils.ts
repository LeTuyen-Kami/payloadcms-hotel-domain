import { differenceInHours, differenceInMinutes, differenceInDays } from 'date-fns'

export type PriceConfig = {
  priceHourlyFirst2Hours?: number
  priceHourlyNextHour?: number
  priceOvernight?: number
  priceDaily?: number
  surchargeEarlyCheckIn?: number
  surchargeLateCheckOut?: number
}

export type BookingType = 'hourly' | 'overnight' | 'daily'

interface PriceResult {
  totalPrice: number
  durationLabel: string
  breakdown: string
}

export const calculateRoomPrice = (
  pricing: PriceConfig,
  type: BookingType,
  checkIn: Date,
  checkOut: Date | null,
  durationUnits?: number, // Explicit duration (hours for hourly, days for daily)
): PriceResult => {
  const {
    priceHourlyFirst2Hours = 0,
    priceHourlyNextHour = 0,
    priceOvernight = 0,
    priceDaily = 0,
  } = pricing

  if (type === 'hourly') {
    // Determine duration
    let hours = durationUnits
    if (!hours && checkOut) {
      const diffMinutes = differenceInMinutes(checkOut, checkIn)
      hours = Math.ceil(diffMinutes / 60)
    }
    if (!hours || hours <= 0) hours = 1 // Minimum 1 hour

    let total = 0
    let breakdown = ''

    if (hours <= 2) {
      total = priceHourlyFirst2Hours
      breakdown = `${priceHourlyFirst2Hours.toLocaleString()}đ / 2h đầu`
    } else {
      const extraHours = hours - 2
      total = priceHourlyFirst2Hours + extraHours * priceHourlyNextHour
      breakdown = `${priceHourlyFirst2Hours.toLocaleString()}đ (2h đầu) + ${(extraHours * priceHourlyNextHour).toLocaleString()}đ (${extraHours}h tiếp theo)`
    }

    return {
      totalPrice: total,
      durationLabel: `${hours} giờ`,
      breakdown,
    }
  }

  if (type === 'overnight') {
    return {
      totalPrice: priceOvernight,
      durationLabel: 'Qua đêm',
      breakdown: `${priceOvernight.toLocaleString()}đ (22h - 12h hôm sau)`,
    }
  }

  if (type === 'daily') {
    let days = durationUnits
    if (!days) {
      if (checkOut) {
        const diffHours = differenceInHours(checkOut, checkIn)
        days = Math.ceil(diffHours / 24)
        if (days < 1) days = 1
      } else {
        days = 1
      }
    }

    // Ensure days is treated as number (it should be, but for TS safety)
    const finalDays = days || 1

    const total = priceDaily * finalDays
    return {
      totalPrice: total,
      durationLabel: `${finalDays} ngày`,
      breakdown:
        finalDays > 1
          ? `${priceDaily.toLocaleString()}đ x ${finalDays} ngày`
          : `${priceDaily.toLocaleString()}đ / ngày`,
    }
  }

  return {
    totalPrice: 0,
    durationLabel: '',
    breakdown: '',
  }
}
