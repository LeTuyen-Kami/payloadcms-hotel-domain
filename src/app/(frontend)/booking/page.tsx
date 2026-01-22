'use client'

import React, { useState, useEffect, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Phone, User, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { DateTimePicker } from '@/components/BookingBar/DateTimePicker'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { calculateBookingDuration, BookingType } from '@/utilities/calculateBookingDuration'

export default function BookingPage() {
  return (
    <React.Suspense fallback={<div className="container py-20 text-center">Đang tải...</div>}>
      <BookingContent />
    </React.Suspense>
  )
}

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams.get('room')
  const branchId = searchParams.get('branch')
  const checkInParam = searchParams.get('checkIn')
  const checkOutParam = searchParams.get('checkOut')
  const typeParam = searchParams.get('type') as BookingType || 'hourly'

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [product, setProduct] = useState<any>(null)

  // States for Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [checkIn, setCheckIn] = useState<Date>(checkInParam ? new Date(checkInParam) : new Date())
  const [checkOut, setCheckOut] = useState<Date | null>(checkOutParam ? new Date(checkOutParam) : null)
  const [duration, setDuration] = useState<number>(0)

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    note: '',
    type: typeParam,
    branch: branchId || '',
  })

  // 1. Fetch Room/Product Data on Load
  useEffect(() => {
    const fetchProduct = async () => {
      if (!roomId) return

      try {
        const res = await fetch(`/api/products?where[room][equals]=${roomId}`)
        const data = await res.json()
        const prod = data.docs?.[0]
        if (prod) {
          setProduct(prod)
        }
      } catch (e) {
        console.error('Failed to fetch product', e)
      }
    }
    fetchProduct()
  }, [roomId])

  // 2. Initialize Duration
  useEffect(() => {
    // If dates are present from URL, calc duration
    if (checkIn) {
      // Recalculate duration using utility
      const dur = calculateBookingDuration(formData.type, checkIn, checkOut || undefined)
      setDuration(dur)
    }
  }, [checkIn, checkOut, formData.type])

  const { addItem, clearCart } = useCart()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!product) {
        alert('Phòng này chưa được kích hoạt tính năng thanh toán online.')
        setLoading(false)
        return
      }

      // Validation
      if (!formData.customerName || !formData.customerPhone) {
        alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại.')
        setLoading(false)
        return
      }

      // Calculate final quantity
      const quantity = calculateBookingDuration(formData.type, checkIn, checkOut || undefined)

      // Add to Cart
      clearCart()
      addItem({
        product,
        quantity,
        validity: {
          checkIn: checkIn.toISOString(),
          checkOut: checkOut ? checkOut.toISOString() : ''
        }
      })

      // Save Customer Info
      // Calculate missing checkOut if needed
      let finalCheckOut = checkOut
      if (!finalCheckOut) {
        if (formData.type === 'hourly') {
          // Default: checkIn + duration hours
          finalCheckOut = new Date(checkIn.getTime() + quantity * 60 * 60 * 1000)
        } else {
          // Default: checkIn + duration days (at same time or specific checkout time?)
          // Usually daily checkout is next day at 12:00, but let's just add days for now to be safe
          finalCheckOut = new Date(checkIn.getTime() + quantity * 24 * 60 * 60 * 1000)
        }
      }

      const customerData = {
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail,
        note: formData.note,
        type: formData.type,
        bookingType: formData.type,
        checkIn: checkIn.toISOString(),
        checkOut: finalCheckOut.toISOString(),
        branch: formData.branch,
        duration: quantity,
      }
      localStorage.setItem('checkout-customer', JSON.stringify(customerData))

      // Redirect
      router.push('/checkout')

    } catch (err: any) {
      console.error(err)
      alert('Có lỗi xảy ra: ' + err.message)
      setLoading(false)
    }
  }

  // Helper to format date display
  const getDisplayTimeRange = () => {
    if (!checkOut) return format(checkIn, 'HH:mm - dd/MM/yyyy', { locale: vi })
    return `${format(checkIn, 'HH:mm dd/MM', { locale: vi })} - ${format(checkOut, 'HH:mm dd/MM', { locale: vi })}`
  }

  // Calculate Total Price Estimate
  const estimatedPrice = React.useMemo(() => {
    if (!product) return 0
    if (formData.type === 'hourly') return (product.priceInVND || 0) * duration
    if (formData.type === 'daily') return (product.priceInVND || 0) * 24 * duration
    return 0
  }, [product, duration, formData.type])

  if (success) return null // Handled in redirect mostly

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="h-[100px] bg-white border-b border-border/40 mb-8" />

      <div className="container max-w-6xl">
        <Link href={`/home`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </Link>
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mb-2">Hoàn tất đặt phòng</h1>
          <p className="text-slate-500 font-light">Chỉ còn một bước nữa thôi, kỳ nghỉ tuyệt vời đang chờ đón bạn!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main Booking Form */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 shadow-xl border border-border/50 rounded-lg space-y-8">

              {/* 1. Booking Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800">Chi tiết đặt phòng</h3>
                </div>

                {/* Booking Type Selector */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
                  {(['hourly', 'daily'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type: t })
                        setCheckOut(null) // Reset checkout when type changes
                      }}
                      className={`py-3 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${formData.type === t
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                      {t === 'hourly' ? 'Theo giờ' : 'Theo ngày'}
                    </button>
                  ))}
                </div>

                {/* Date/Time Picker Trigger */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase">Thời gian nhận phòng - Trả phòng</label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary transition-colors text-left"
                  >
                    <span className="font-semibold text-slate-900">{getDisplayTimeRange()}</span>
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </button>
                  {/* Duration Badge */}
                  <div className="absolute right-4 top-0 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {formData.type === 'hourly' ? `${duration} giờ` : `${duration} ngày`}
                  </div>

                  {/* Check-out info hint */}
                  <p className="text-xs text-slate-400 italic">
                    {formData.type === 'hourly' && `Tự động tính ${duration} giờ kể từ giờ nhận phòng`}
                    {formData.type === 'daily' && 'Check-out mặc định: 12:00 trưa'}
                  </p>

                  {showDatePicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                      <div className="absolute top-full left-0 mt-2 z-50">
                        <DateTimePicker
                          bookingType={formData.type as BookingType}
                          initialDate={checkIn}
                          initialDuration={duration}
                          onApply={(start, end) => {
                            setCheckIn(start)
                            if (end) setCheckOut(end)
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Customer Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-slate-800">Thông tin của bạn</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="VD: 090 123 4567"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email (Để nhận xác nhận)</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="VD: email@example.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ghi chú đặc biệt</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all h-24 resize-none"
                      placeholder="Bạn có yêu cầu gì thêm không? (VD: Check-in muộn, trang trí phòng...)"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Sidebar / Price Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Card */}
            <div className="bg-slate-900 text-white p-8 rounded-lg shadow-2xl sticky top-24">
              <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-800">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Thông tin phòng</p>
                  <h2 className="text-2xl font-serif text-white mb-1">{product?.title || 'Đang tải...'}</h2>
                  <p className="text-slate-400 text-sm">
                    {formData.type === 'hourly' && `${product?.priceInVND?.toLocaleString()}đ / 1 giờ`}
                    {formData.type === 'daily' && `${((product?.priceInVND || 0) * 24).toLocaleString()}đ / 1 ngày`}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Đơn giá:</span>
                  <span className="font-medium">
                    {formData.type === 'hourly' && `${product?.priceInVND?.toLocaleString()} VND`}
                    {formData.type === 'daily' && `${((product?.priceInVND || 0) * 24).toLocaleString()} VND`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Thời gian:</span>
                  <span className="font-medium">x {duration} {formData.type === 'hourly' ? 'giờ' : 'ngày'}</span>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-lg font-serif">Tổng tạm tính:</span>
                  <span className="text-3xl font-bold text-primary">{estimatedPrice.toLocaleString()} VND</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !product}
                className="w-full bg-primary hover:bg-[#b08d66] text-white py-4 font-bold uppercase tracking-wider rounded transition-all shadow-lg hover:shadow-primary/20 hover:-translate-y-1 mb-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Đang xử lý...' : (
                    <>
                      Thanh toán ngay <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>

              <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" /> Cam kết bảo mật thông tin
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
