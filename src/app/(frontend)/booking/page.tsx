'use client'

import React, { useState, useEffect, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { submitBooking } from './actions/submitBooking'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams.get('room')
  const branchId = searchParams.get('branch')
  const checkInParam = searchParams.get('checkIn')
  const typeParam = searchParams.get('type') || 'daily'

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [roomData, setRoomData] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    checkIn: checkInParam || '',
    type: typeParam,
    note: '',
    branch: branchId || '',
  })

  useEffect(() => {
    if (roomId) {
      // In a real app, we'd fetch room data via an API or server component
      // For this prototype, if we had an API route we'd use it.
      // We'll skip detailed room fetch here to keep it simple, 
      // but ideally we'd show the room title.
    }
  }, [roomId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await submitBooking(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      alert('Có lỗi xảy ra: ' + result.error)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-12 text-center shadow-2xl border border-primary/20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-serif mb-4 text-slate-900">Đặt phòng thành công!</h1>
          <p className="text-slate-600 mb-8 font-light italic">
            Cảm ơn bạn đã lựa chọn Hotel Cloud 9. Nhân viên của chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thông tin đặt phòng.
          </p>
          <p className="text-xs text-muted-foreground animate-pulse">Đang chuyển hướng về trang chủ...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="h-16 bg-white border-b border-border/40 mb-12" />

      <div className="container max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
               <h1 className="text-4xl font-serif text-slate-900 leading-tight">Yêu cầu Đặt phòng</h1>
               <p className="text-slate-500 font-light max-w-md">Vui lòng cung cấp thông tin của bạn bên dưới. Chúng tôi sẽ chuẩn bị mọi thứ sẵn sàng cho sự hiện diện của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-serif flex items-center gap-2 text-slate-800">
                   <User className="w-4 h-4 text-primary" />
                   Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Họ và tên *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900"
                        placeholder="Nguyễn Văn A"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Số điện thoại *</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900"
                        placeholder="090 123 4567"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Địa chỉ Email (Không bắt buộc)</label>
                   <input 
                     type="email" 
                     value={formData.customerEmail}
                     onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                     className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900"
                     placeholder="john@example.com"
                   />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-serif flex items-center gap-2 text-slate-800">
                   <Calendar className="w-4 h-4 text-primary" />
                   Chi tiết đặt phòng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Hình thức đặt</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900 appearance-none"
                      >
                         <option value="hourly">Theo giờ (2h+)</option>
                         <option value="overnight">Qua đêm</option>
                         <option value="daily">Theo ngày</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Ngày & Giờ nhận phòng</label>
                      <input 
                        type="datetime-local" 
                        required
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Yêu cầu thêm</label>
                   <textarea 
                     value={formData.note}
                     onChange={(e) => setFormData({...formData, note: e.target.value})}
                     className="w-full bg-white border border-slate-200 px-4 py-3 focus:outline-none focus:border-primary transition-colors text-slate-900 h-24"
                     placeholder="Chúng tôi có thể hỗ trợ gì thêm cho bạn không? (VD: chuẩn bị nệm thêm, quà kỷ niệm...)"
                   />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-5 font-bold tracking-[0.2em] uppercase hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-wait"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
              </button>
            </form>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-900 text-white p-8 space-y-8">
                <div>
                   <h4 className="text-xl font-serif mb-4">Tại sao nên đặt tại Cloud 9?</h4>
                   <ul className="space-y-4">
                      {[
                        'Cam kết giá tốt nhất',
                        'Hủy phòng linh hoạt (trước 24h)',
                        'Xác nhận ngay lập tức',
                        'Thanh toán đa dạng'
                      ].map(item => (
                        <li key={item} className="flex gap-2 text-xs text-slate-400 font-light">
                           <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="pt-8 border-t border-slate-800 text-xs font-light text-slate-400 space-y-4">
                   <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <p>Check-in: 14:00<br/>Check-out: 12:00 (Ngày hôm sau)</p>
                   </div>
                   <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                      <p>Hotline hỗ trợ: 1900 1234 (24/7)</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  )
}
