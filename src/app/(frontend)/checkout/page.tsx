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

  const [customerInfo, setCustomerInfo] = useState<any>(null)

  useEffect(() => {
    const savedCustomer = localStorage.getItem('checkout-customer')
    if (savedCustomer) {
      setCustomerInfo(JSON.parse(savedCustomer))
    }
  }, [])

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

  if (items.length === 0 && !paymentInfo && !orderId) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng trống</h1>
        <p className="mb-8">Bạn chưa chọn phòng nào.</p>
        <button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg">
          Xem danh sách phòng
        </button>
      </div>
    )
  }

  // Show restoring state
  if (orderId && !paymentInfo && !isExpired) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-lg text-primary animate-pulse">Đang khôi phục thông tin đơn hàng...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Thanh toán</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Order Summary */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Thông tin đơn hàng</h2>

          {customerInfo && (
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="font-semibold mb-2">Khách hàng:</h3>
              <p className="text-sm"><span className="text-muted-foreground">Họ tên:</span> {customerInfo.name}</p>
              <p className="text-sm"><span className="text-muted-foreground">SĐT:</span> {customerInfo.phone}</p>
              {customerInfo.email && <p className="text-sm"><span className="text-muted-foreground">Email:</span> {customerInfo.email}</p>}
              <p className="text-sm mt-2"><span className="text-muted-foreground">Loại đặt:</span> {
                customerInfo.bookingType === 'hourly' ? 'Theo giờ' :
                  customerInfo.bookingType === 'overnight' ? 'Qua đêm' :
                    'Theo ngày'
              }</p>
              {customerInfo.duration && (
                <p className="text-sm"><span className="text-muted-foreground">Thời lượng:</span> {customerInfo.duration} {
                  customerInfo.bookingType === 'hourly' ? 'giờ' :
                    customerInfo.bookingType === 'daily' ? 'ngày' :
                      'đêm'
                }</p>
              )}
              <p className="text-sm"><span className="text-muted-foreground">Check-in:</span> {new Date(customerInfo.checkIn).toLocaleString('vi-VN')}</p>
              {customerInfo.checkOut && <p className="text-sm"><span className="text-muted-foreground">Check-out:</span> {new Date(customerInfo.checkOut).toLocaleString('vi-VN')}</p>}
              {customerInfo.note && <p className="text-sm mt-2"><span className="text-muted-foreground">Ghi chú:</span> {customerInfo.note}</p>}
            </div>
          )}

          {paymentInfo ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isPaid ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {isPaid ? 'Thanh toán thành công! Cảm ơn bạn đã đặt phòng.' : 'Đơn hàng đã được tạo. Vui lòng thanh toán.'}
              </div>
              <div className="border-t pt-4">
                <p className="font-semibold">Mã đơn hàng:</p>
                <p className="text-muted-foreground">{paymentInfo.content}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <h3 className="font-semibold">{item.product.title}</h3>
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  </div>
                  {/* Access price safely */}
                  <p className="font-semibold">{(item.product.priceInVND || 0).toLocaleString('vi-VN')} ₫</p>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <span className="text-xl font-bold">Tổng cộng:</span>
                <span className="text-xl font-bold text-primary">{total.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Thanh toán chuyển khoản</h2>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
              {error}
            </div>
          )}

          {!paymentInfo ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Vui lòng nhấn nút bên dưới để tạo đơn hàng và nhận thông tin chuyển khoản ngân hàng.
              </p>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Thanh toán với SePay'}
              </button>
            </div>
          ) : isExpired ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-800">Đơn hàng đã hết hạn!</h3>
              <p className="text-gray-600">Bạn đã quá thời gian thanh toán (15 phút).</p>
              <button
                onClick={() => {
                  clearCart()
                  router.push('/')
                }}
                className="mt-4 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90"
              >
                Đặt lại đơn mới
              </button>
            </div>
          ) : isPaid ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800">Thanh toán hoàn tất!</h3>
              <p className="text-gray-600">Chúng tôi đã nhận được thanh toán của bạn.</p>
              <button onClick={() => router.push('/')} className="mt-4 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90">
                Về trang chủ
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">

              {/* Timer */}
              {timeLeft !== null && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg font-bold inline-block mb-4">
                  Thời gian còn lại: {formatTime(timeLeft)}
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border inline-block mx-auto relative block">
                {/* QR Code */}
                <img src={paymentInfo.qrUrl} alt="SePay QR Code" className="w-64 h-64 object-contain" />

                {/* Loading indicator */}
                <div className="mt-4 flex items-center justify-center gap-2 text-primary animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                  <span className="text-sm font-semibold ml-2">Đang chờ thanh toán...</span>
                </div>
              </div>

              <div className="text-left space-y-3 bg-muted/50 p-6 rounded-lg">
                <p><span className="font-semibold">Ngân hàng:</span> {paymentInfo.bankBin}</p>
                <p><span className="font-semibold">Số tài khoản:</span> {paymentInfo.accountNumber}</p>
                <p><span className="font-semibold">Chủ tài khoản:</span> {paymentInfo.accountName}</p>
                <p><span className="font-semibold">Số tiền:</span> <span className="text-primary font-bold text-lg">{paymentInfo.amount.toLocaleString('vi-VN')} ₫</span></p>
                <p><span className="font-semibold">Nội dung chuyển khoản:</span> <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-bold">{paymentInfo.content}</span></p>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                * Hệ thống sẽ tự động cập nhật ngay khi nhận được thanh toán. Không cần F5.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

