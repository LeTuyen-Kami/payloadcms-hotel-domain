import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const now = new Date()
    const createdAt = new Date(order.createdAt)
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60

    // Check for expiration (15 minutes)
    if (diffInMinutes > 15 && order.sepayPaymentStatus === 'unpaid') {
      await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          sepayPaymentStatus: 'idled',
        },
      })

      return NextResponse.json({
        status: 'idled',
        createdAt: order.createdAt,
      })
    }

    // Construct Payment Info for restoration
    const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || 'YOUR_ACCOUNT_NUMBER'
    const bankBin = process.env.SEPAY_BANK_BIN || 'YOUR_BANK_BIN'
    const accountName = process.env.SEPAY_ACCOUNT_NAME || 'YOUR_ACCOUNT_NAME'
    const transferContent = `DH${order.id.toString().slice(-6)}`
    const totalAmount = order.amount || 0

    return NextResponse.json({
      status: order.sepayPaymentStatus,
      createdAt: order.createdAt,
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
    console.error('Error fetching order status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
