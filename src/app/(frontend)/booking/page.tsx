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
import { calculateRoomPrice } from '@/utilities/priceUtils'

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

  // 2. Initialize Duration and Recalc Price
  useEffect(() => {
    // If dates are present from URL, calc duration
    if (checkIn) {
      // Recalculate duration using utility
      const dur = calculateBookingDuration(formData.type, checkIn, checkOut || undefined)
      setDuration(dur)
    }
  }, [checkIn, checkOut, formData.type])

  const { addItem, clearCart } = useCart()

  // Calculate Price Result (Total + Breakdown)
  const priceResult = React.useMemo(() => {
    if (!product) return { totalPrice: 0, durationLabel: '', breakdown: '' }

    // Map product fields to PriceConfig
    // Note: product fields were synced from Rooms.ts hook.
    // Ensure product object has these fields. If not present (old products), logic handles defaults (0).
    const priceConfig = {
      priceHourlyFirst2Hours: product.priceInVND, // Mapped in sync (first 2h)
      priceHourlyNextHour: product.priceHourlyNextHour,
      priceOvernight: product.priceOvernight,
      priceDaily: product.priceDaily,
    }

    return calculateRoomPrice(
      priceConfig,
      formData.type as 'hourly' | 'daily' | 'overnight',
      checkIn,
      checkOut,
      formData.type === 'hourly' ? duration : undefined
    )
  }, [product, formData.type, checkIn, checkOut, duration])

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

      // Add to Cart with CALCULATED PRICE
      clearCart()
      addItem({
        product,
        quantity: 1, // Quantity 1 booking
        price: priceResult.totalPrice, // Override price
        validity: {
          checkIn: checkIn.toISOString(),
          checkOut: checkOut ? checkOut.toISOString() : '',
          duration // Store duration for display reference
        }
      })

      // Save Customer Info
      // Calculate missing checkOut if needed (for record)
      let finalCheckOut = checkOut
      if (!finalCheckOut) {
        // Logic fallback if checkOut undefined (e.g. hourly without picking end range specifically? but usually managed by logic)
        if (formData.type === 'hourly') {
          finalCheckOut = new Date(checkIn.getTime() + duration * 60 * 60 * 1000)
        } else if (formData.type === 'overnight') {
          // 12PM next day
          const nextDay = new Date(checkIn)
          nextDay.setDate(nextDay.getDate() + 1)
          nextDay.setHours(12, 0, 0, 0)
          finalCheckOut = nextDay
        } else {
          // Daily
          finalCheckOut = new Date(checkIn.getTime() + duration * 24 * 60 * 60 * 1000)
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
        duration: duration,
        totalPrice: priceResult.totalPrice
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

  // ... (EstimatedPrice deprecated by priceResult)

  if (success) return null // Handled in redirect mostly

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="h-[100px] lg:h-[80px] bg-white border-b border-border/40 mb-8" />

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
                <div className="grid grid-cols-3 gap-3 p-1 bg-slate-100 rounded-lg">
                  {(['hourly', 'overnight', 'daily'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type: t })
                        setCheckOut(null) // Reset checkout when type changes
                      }}
                      className={`py-3 text-xs md:text-sm font-bold uppercase tracking-wide rounded-md transition-all ${formData.type === t
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                      {t === 'hourly' && 'Theo giờ'}
                      {t === 'overnight' && 'Qua đêm'}
                      {t === 'daily' && 'Theo ngày'}
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
                    {priceResult.durationLabel}
                  </div>

                  {/* Check-out info hint */}
                  <p className="text-xs text-slate-400 italic">
                    {formData.type === 'hourly' && `* Quá giờ check-out sẽ tính phí theo bảng giá.`}
                    {formData.type === 'overnight' && '* Check-out trước 12:00 trưa hôm sau.'}
                    {formData.type === 'daily' && '* Check-out trước 12:00 trưa.'}
                  </p>

                  {showDatePicker && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                      <div className="absolute top-full left-0 mt-2 z-50">
                        <DateTimePicker
                          bookingType={formData.type as BookingType}
                          initialDate={checkIn}
                          initialDuration={duration}
                          onApply={(start, end, dur) => {
                            setCheckIn(start)
                            if (end) setCheckOut(end)
                            if (dur) setDuration(dur)
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Customer Info ... (Unchanged) */}
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
                  <p className="text-slate-400 text-sm italic">
                    {priceResult.breakdown}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  {/* Breakdown details */}
                  <span className="text-slate-400">Chi tiết:</span>
                  <span className="font-medium text-right">{priceResult.breakdown}</span>
                </div>
                {priceResult.durationLabel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Thời gian:</span>
                    <span className="font-medium">{priceResult.durationLabel}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-lg font-serif">Tổng tạm tính:</span>
                  <span className="text-3xl font-bold text-primary">{priceResult.totalPrice.toLocaleString()} VND</span>
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
