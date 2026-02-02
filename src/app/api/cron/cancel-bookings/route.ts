import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Simple authorization check using a secret in Environment Variables
  // Add CRON_SECRET=your_secret_here to your .env file and Vercel Cron settings
  const authHeader = req.headers.get('Authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    // Find pending bookings created more than 15 minutes ago
    const expiredBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          {
            status: {
              equals: 'pending',
            },
          },
          {
            createdAt: {
              less_than: fifteenMinutesAgo.toISOString(),
            },
          },
        ],
      },
      limit: 50, // Process in batches to avoid timeout
      depth: 0,
    })

    if (expiredBookings.totalDocs === 0) {
      return NextResponse.json({ message: 'No expired bookings found.' })
    }

    const results = await Promise.all(
      expiredBookings.docs.map(async (booking) => {
        try {
          await payload.update({
            collection: 'bookings',
            id: booking.id,
            data: {
              status: 'cancelled',
              note: booking.note
                ? `${booking.note}\n[System]: Auto-cancelled due to non-payment (15m timeout).`
                : '[System]: Auto-cancelled due to non-payment (15m timeout).',
            },
          })
          return { id: booking.id, status: 'cancelled' }
        } catch (err) {
          console.error(`Failed to cancel booking ${booking.id}`, err)
          return { id: booking.id, error: 'failed' }
        }
      }),
    )

    return NextResponse.json({
      message: `Processed ${results.length} bookings`,
      results,
    })
  } catch (error) {
    console.error('Error in cancel-bookings cron:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
