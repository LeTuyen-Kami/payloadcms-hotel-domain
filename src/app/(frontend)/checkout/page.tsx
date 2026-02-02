'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/components/CartProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { useSearchParams } from 'next/navigation' // Add useSearchParams

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="container mx-auto py-20 text-center text-primary">Đang tải thông tin thanh toán...</div>}>
      <CheckoutContent />
    </React.Suspense>
  )
}

function CheckoutContent() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams() // Get search params
  const initialOrderId = searchParams.get('orderId') // Get orderId from URL

  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(initialOrderId) // Init from URL
  const [isPaid, setIsPaid] = useState(false)
  const [isExpired, setIsExpired] = useState(false) // New state for expiration
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // State for countdown
  const [error, setError] = useState<string | null>(null)
  const [displayItems, setDisplayItems] = useState<any[]>([])

  const [customerInfo, setCustomerInfo] = useState<any>(null)

  useEffect(() => {
    const savedCustomer = localStorage.getItem('checkout-customer')
    if (savedCustomer) {
      setCustomerInfo(JSON.parse(savedCustomer))
    }
  }, [])

  // Sync displayItems with cart items initially
  useEffect(() => {
    if (items.length > 0) {
      setDisplayItems(items)
    }
  }, [items])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !paymentInfo) {
      // Optional: Redirect to rooms or home if empty. 
    }
  }, [items, paymentInfo])

  // Poll for payment status
  useEffect(() => {
    if (!orderId || isPaid || isExpired) return // Stop polling if expired

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment-status?orderId=${orderId}`)
        const data = await res.json()

        if (data.status === 'paid') {
          setIsPaid(true)
          clearInterval(interval)
        } else if (data.status === 'idled') {
          setIsExpired(true)
          clearInterval(interval)
        }

        // Restore payment info if missing (e.g. after reload)
        if (!paymentInfo && data.paymentInfo) {
          setPaymentInfo(data.paymentInfo)
        }

        // Sync time left if createdAt is provided
        if (data.createdAt) {
          const created = new Date(data.createdAt).getTime()
          const expiresAt = created + 15 * 60 * 1000 // 15 minutes
          const now = new Date().getTime()
          const left = Math.max(0, Math.floor((expiresAt - now) / 1000))
          setTimeLeft(left)

          if (left <= 0) {
            setIsExpired(true)
            clearInterval(interval)
          }
        }

      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [orderId, isPaid, isExpired])

  // Countdown timer effect (local decrement for smoothness)
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isPaid || isExpired) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isPaid, isExpired])

  // Helper to format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: items,
          totalAmount: total,
          bookingDetails: customerInfo || {
            // Fallback if no info found
            checkIn: new Date().toISOString(),
          }
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment creation failed')
      }

      setPaymentInfo(data.paymentInfo)
      setOrderId(data.orderId)

      // Update URL with orderId
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('orderId', data.orderId)
      window.history.replaceState({}, '', newUrl.toString())

      clearCart() // Clear cart after order creation to prevent double submission

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Restore order info if page reloaded with orderId
  useEffect(() => {
    if (orderId && items.length === 0) {
      // Fetch order details
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/orders/${orderId}`)
          if (!res.ok) return; // Silent fail or handle error
          const orderData = await res.json()

          if (orderData && orderData.items) {

            // Let's create a displayItems state.
            const restoredItems = orderData.items.map((item: any) => ({
              product: {
                title: orderData.bookingRoom,
                branch: { title: '...' },
                priceInVND: item.price
              },
              quantity: item.quantity,
              price: orderData.amount
            }))
            setDisplayItems(restoredItems)
          }

          // Also restore customer info if missing
          if (!customerInfo) {
            setCustomerInfo({
              name: orderData.customerName,
              phone: orderData.customerPhone,
              email: orderData.customerEmail,
              note: orderData.note,
              bookingType: orderData.bookingType || 'hourly', // You might need to save this to Order to retrieve it
              checkIn: orderData.checkIn,
              checkOut: orderData.checkOut,
              duration: orderData.bookingDuration // This might be string "XX giờ"
            })
          }

        } catch (e) {
          console.error("Failed to restore order", e)
        }
      }
      fetchOrder()
    }
  }, [orderId, items.length])


  // Auto-trigger payment creation
  useEffect(() => {
    if (items.length > 0 && customerInfo && !paymentInfo && !orderId && !loading && !error) {
      handlePayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, paymentInfo, orderId, customerInfo]) // Added customerInfo to deps to wait for it to load

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (items.length === 0 && !paymentInfo && !orderId) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="mb-8 text-muted-foreground">Bạn chưa chọn phòng nào.</p>
        <button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Xem danh sách phòng
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 mt-[80px] px-4 md:py-16">
      <h1 className="text-3xl md:text-4xl font-serif text-center mb-10 text-slate-800">Thanh toán đặt phòng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

        {/* Left Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-slate-100 uppercase tracking-wide text-slate-700">Thông tin đơn hàng</h2>

            {/* Customer Details */}
            {customerInfo && (
              <div className="mb-8 bg-slate-50 p-4 rounded-lg">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 ml-8">
                  <p><span className="font-medium text-slate-900">Họ tên:</span> {customerInfo.name}</p>
                  <p><span className="font-medium text-slate-900">SĐT:</span> {customerInfo.phone}</p>
                  {customerInfo.email && <p><span className="font-medium text-slate-900">Email:</span> {customerInfo.email}</p>}
                  {customerInfo.note && <p className="italic bg-white p-2 rounded border border-slate-100 mt-1">"{customerInfo.note}"</p>}
                </div>
              </div>
            )}

            {/* Room Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                Chi tiết phòng
              </h3>
              {displayItems.map((item, index) => {
                // Determine duration label from validity or customer info
                const durationLabel = customerInfo?.duration
                  ? `${customerInfo.duration}`
                  : `${item.quantity} ${customerInfo?.bookingType === 'daily' ? 'ngày' : 'giờ'}`;

                // Use item.price (This is the calculated total price for this booking)
                // Fallback to total if single item
                const actualPrice = item.price || total;



                return (
                  <div key={index} className="ml-8 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-slate-900">{item.product.title}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">{formatCurrency(actualPrice)}</p>
                      </div>
                    </div>

                    {/* Booking Specs */}
                    <div className="bg-slate-50 rounded p-3 text-sm space-y-2 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Loại đặt:</span>
                        <span className="font-medium text-slate-900">
                          {customerInfo?.bookingType === 'hourly' ? 'Theo giờ' :
                            customerInfo?.bookingType === 'overnight' ? 'Qua đêm' : 'Theo ngày'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian:</span>
                        <span className="font-medium text-slate-900">{durationLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Check-in:</span>
                        <span className="font-medium text-slate-900">
                          {customerInfo?.checkIn ? new Date(customerInfo.checkIn).toLocaleString('vi-VN') : '...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Check-out:</span>
                        <span className="font-medium text-slate-900">
                          {customerInfo?.checkOut ? new Date(customerInfo.checkOut).toLocaleString('vi-VN') : '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex justify-between items-end">
              <span className="text-slate-500 font-medium pb-1">Tổng thanh toán</span>
              <span className="text-3xl font-bold text-primary">{formatCurrency(items.length > 0 ? total : paymentInfo?.amount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-slate-100 uppercase tracking-wide text-slate-700">Thanh toán chuyển khoản</h2>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-2 mb-6">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="underline ml-auto text-sm">Thử lại</button>
            </div>
          )}

          {/* Loading State */}
          {loading && !paymentInfo && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse">Đang tạo thông tin thanh toán...</p>
            </div>
          )}

          {/* Expired State */}
          {isExpired && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Đơn hàng đã hết hạn</h3>
              <p className="text-slate-500 mb-6">Mã QR đã hết hiệu lực. Vui lòng đặt lại.</p>
              <button onClick={() => { clearCart(); router.push('/'); }} className="bg-primary text-white w-full py-3 rounded-lg font-bold">
                Đặt lại phòng
              </button>
            </div>
          )}

          {/* Success State */}
          {isPaid && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h3>
              <p className="text-slate-500 mb-6">Cảm ơn bạn đã sử dụng dịch vụ.</p>
              <button onClick={() => router.push('/')} className="bg-primary text-white w-full py-3 rounded-lg font-bold">
                Về trang chủ
              </button>
            </div>
          )}

          {/* Active Payment State */}
          {paymentInfo && !isExpired && !isPaid && (
            <div className="space-y-6">
              {timeLeft !== null && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 text-sm font-bold rounded-full border border-orange-100">
                    Hết hạn sau: {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center">
                <div className="p-4 bg-white border-2 border-primary/20 rounded-xl shadow-sm mb-4">
                  <img src={paymentInfo.qrUrl} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56 object-contain mix-blend-multiply" />
                </div>
                <p className="text-sm text-center text-primary font-medium animate-pulse">
                  Đang chờ xác nhận thanh toán...
                </p>
              </div>

              <div className="space-y-3 text-sm border-t border-slate-100 pt-6">
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Ngân hàng</span>
                  <span className="font-bold text-slate-800">{paymentInfo.bankBin}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Chủ tài khoản</span>
                  <span className="font-bold text-slate-800 uppercase">{paymentInfo.accountName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Số tài khoản</span>
                  <span className="font-bold text-slate-800 text-lg tracking-wide">{paymentInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Nội dung chuyển khoản</span>
                  <span className="font-mono font-bold text-primary bg-yellow-50 px-2 py-0.5 rounded">{paymentInfo.content}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Số tiền</span>
                  <span className="font-bold text-primary text-xl">{formatCurrency(paymentInfo.amount)}</span>
                </div>
              </div>

              <p className="text-xs text-center text-slate-400 italic">
                * Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

