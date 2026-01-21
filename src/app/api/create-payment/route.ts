import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

import { checkAvailability } from '@/utilities/checkAvailability'

export async function POST(req: Request) {
  const { bookingDetails, cartItems, totalAmount } = await req.json()

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    // 0. Extract Room ID and Check Availability
    // Assuming single-room booking for now as per current flow
    const product = cartItems[0].product
    // Logic to get room ID might depend on how product is populated.
    // Usually product.room is the connection.
    // If product.room is an object/ID, we use it.
    const roomId = typeof product.room === 'object' ? product.room.id : product.room

    if (roomId) {
      const isAvailable = await checkAvailability({
        payload,
        room: roomId,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
      })

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Rất tiếc, phòng này đã hết trong khoảng thời gian bạn chọn.' },
          { status: 400 },
        )
      }
    }

    // 1. Create Order in Payload (Pending status)
    const order = await payload.create({
      collection: 'orders',
      data: {
        amount: totalAmount,
        currency: 'VND', // SePay works with VND
        items: cartItems.map((item: any) => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.priceInVND,
        })),
        sepayPaymentStatus: 'unpaid',

        // Save customer info
        customerName: bookingDetails.name || bookingDetails.customerName,
        customerPhone: bookingDetails.phone || bookingDetails.customerPhone,
        customerEmail: bookingDetails.email || bookingDetails.customerEmail,
        note: bookingDetails.note,

        // Save booking details
        bookingRoom: cartItems[0]?.product?.title || '',
        bookingDuration: `${bookingDetails.duration} ${bookingDetails.bookingType === 'hourly' ? 'giờ' : bookingDetails.bookingType === 'daily' ? 'ngày' : 'đêm'}`,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
      },
    })

    // 1.1 Create Booking Record (to lock inventory)
    if (roomId) {
      await payload.create({
        collection: 'bookings',
        data: {
          room: roomId,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          status: 'pending', // Pending payment
          customerName: bookingDetails.name || bookingDetails.customerName,
          customerPhone: bookingDetails.phone || bookingDetails.customerPhone,
          customerEmail: bookingDetails.email || bookingDetails.customerEmail,
          note: `Auto-created from Order #${order.id}`,
          type: bookingDetails.bookingType || 'hourly', // Fallback
          branch: typeof product.branch === 'object' ? product.branch.id : product.branch || '1', // Fallback if missing
        },
      })
    }

    // 2. Generate SePay Payment Info
    // SePay uses a specific format for transfer content to identify transactions.
    // Usually it's a prefix + Code. Let's use the Order ID or a short code.
    // For simplicity, we use the Order ID.
    // Ensure the content length and format meets bank requirements.
    // SePay content usually looks like: SEPAY12345 (Prefix + OrderID)

    // NOTE: You need to configure your SePay settings (Bank Account, etc) in your SePay Dashboard.
    // Here we just construct the data needed for the QR code or transfer.

    const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || 'YOUR_ACCOUNT_NUMBER'
    const bankBin = process.env.SEPAY_BANK_BIN || 'YOUR_BANK_BIN' // e.g., 970422 (MBBank)
    const accountName = process.env.SEPAY_ACCOUNT_NAME || 'YOUR_ACCOUNT_NAME'
    const transferContent = `DH${order.id.toString().slice(-6)}` // Example shorter content: DH + last 6 chars of ID

    // Update order with the generated transaction code wrapper if needed,
    // but SePay usually matches based on the content found in bank transaction.
    // We can store the expected content to match later if we want.

    return NextResponse.json({
      orderId: order.id,
      paymentInfo: {
        accountNumber,
        bankBin,
        accountName,
        amount: totalAmount,
        content: transferContent,
        qrUrl: `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankBin}&amount=${totalAmount}&des=${transferContent}`,
      },
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
