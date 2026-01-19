'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function submitBooking(formData: any) {
  const payload = await getPayload({ config: configPromise })

  try {
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        ...formData,
        status: 'pending',
      } as any,
    })

    return { success: true, id: booking.id }
  } catch (error: any) {
    console.error('Booking submission error:', error)
    return { success: false, error: error.message }
  }
}
