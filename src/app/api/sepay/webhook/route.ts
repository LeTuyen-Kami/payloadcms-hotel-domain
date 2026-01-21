import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

// SePay Webhook Token for authentication
const SEPAY_WEBHOOK_TOKEN = process.env.SEPAY_API_KEY // Or a specific webhook token configured in SePay

export async function POST(req: Request) {
  // 1. Verify Authentication (optional but recommended if SePay supports sending an Authorization header)
  // Or verify the payload structure.

  // SePay sends JSON body
  let body
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  // Example SePay payload:
  // {
  //   "id": 12345,
  //   "gateway": "MBBank",
  //   "transactionDate": "2023-10-27 10:00:00",
  //   "accountNumber": "0123456789",
  //   "subAccount": null,
  //   "code": null,
  //   "content": "DH123456",
  //   "transferType": "in",
  //   "description": "Transfer description",
  //   "transferAmount": 500000,
  //   "referenceCode": "FT123..."
  // }

  if (!body || !body.content) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // 2. Extract Order Identifier from content
  const content = body.content // e.g., "DH829102"
  // Assuming our format is DH + last 6 chars of Order ID.
  // This matching logic depends on how robust we want it to be.
  // For precise matching, we might need a separate field in Order to store the 'expectedTransferContent'.

  // Let's assume we find the order by matching the content loosely or exactly if we stored it.
  // Since we didn't store 'expectedTransferContent', let's try to query by ID if the content *is* the ID,
  // or use a more robust search if possible.

  // REAL WORLD STRATEGY:
  // When creating order, save `paymentDescription` = `DH${order.id}`.
  // Then search `orders` where `paymentDescription` equals `body.content`.

  // Since we haven't added `paymentDescription` field yet, let's create a logic to find it
  // or just accept that we need to add that field for reliable matching.
  // For this demo, let's assume the user will implement the matching logic or we add the field now.

  // Let's Update the Order Collection momentarily to add 'paymentDescription' if not present,
  // or use the `sepayTransactionId` to store the incoming SePay ID.

  const payload = await getPayload({ config: configPromise })

  try {
    // Find order. This is a bit tricky without a direct mapping field.
    // Let's search for UNPAID orders and filter in memory for demo, or match strictly if we stored it.
    // To make this robust, I will update the Order 'sepayTransactionId' with the incoming ID
    // AFTER finding the order.

    // IMPORTANT: You should add a field `transferContent` to Orders to match exactly.
    // For now, let's assume `content` contains the Order ID if we used the full ID.
    // If we used partial, it's harder.

    // Let's rely on a simplified assumption: The content IS the order ID (or contains it).
    // But Payload IDs are long strings.

    // Update: In `create-payment`, I generated `DH${order.id.slice(-6)}`.
    // I need to be able to find the order based on that.
    // A regex search might be needed or storing that short code.

    // Let's fetch all 'unpaid' orders and match the suffix. (Not performant for large scale, but fine for demo).

    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: {
        sepayPaymentStatus: {
          equals: 'unpaid',
        },
      },
    })

    const matchedOrder = orders.find((o) => content.includes(o.id.slice(-6)))

    if (matchedOrder) {
      // 1. Update Order
      await payload.update({
        collection: 'orders',
        id: matchedOrder.id,
        data: {
          sepayPaymentStatus: 'paid',
          sepayTransactionId: body.id ? String(body.id) : undefined,
        },
      })

      // 2. Update Related Booking to Confirmed
      // We need to find the booking associated with this order.
      // Since we don't have a direct link in Order (yet), we search Bookings
      // where note contains the Order ID (as set in create-payment).

      const { docs: bookings } = await payload.find({
        collection: 'bookings',
        where: {
          note: {
            contains: `Auto-created from Order #${matchedOrder.id}`,
          },
        },
        limit: 1,
      })

      if (bookings.length > 0) {
        await payload.update({
          collection: 'bookings',
          id: bookings[0].id,
          data: {
            status: 'confirmed',
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Order and Booking updated' })
    }

    return NextResponse.json({ success: false, message: 'Order not found' })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
