import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { notFound } from 'next/navigation'
import { Media } from '@/components/Media'
import Link from 'next/link'
import { ArrowLeft, Check, Info, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RoomDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const room = rooms[0]

  if (!room) {
    return notFound()
  }

  const { title, gallery, amenities, pricing, description, branch } = room
  const branchData = typeof branch === 'object' ? branch : null

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Navigation Spacer */}
      <div className="h-16 bg-white border-b border-border/40" />

      <section className="container py-8 md:py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách phòng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Gallery & Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {gallery && gallery.length > 0 ? (
                 gallery.map((item: any, idx: number) => (
                   <div key={idx} className={`relative overflow-hidden ${idx === 0 ? 'md:col-span-2 h-[400px] md:h-[600px]' : 'h-[250px] md:h-[350px]'}`}>
                      <Media resource={item.image} fill imgClassName="object-cover hover:scale-105 transition-transform duration-700" />
                   </div>
                 ))
               ) : (
                  <div className="md:col-span-2 h-[400px] bg-slate-200 flex items-center justify-center text-muted-foreground italic">
                    Chưa có hình ảnh
                  </div>
               )}
            </div>

            {/* Room Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                 <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900">{title}</h1>
                 {branchData && (
                   <p className="text-primary font-medium tracking-wide uppercase text-sm">
                      {branchData.title}
                   </p>
                 )}
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {description || "Trải nghiệm không gian nghỉ dưỡng đẳng cấp và tinh tế tại hệ thống phòng của chúng tôi. Được thiết kế tỉ mỉ với đầy đủ tiện nghi hiện đại, mang lại cho bạn những giây phút thư giãn tuyệt vời nhất."}
              </div>

              {/* Amenities */}
              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-xl font-serif mb-6">Tiện nghi phòng</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {amenities?.map((amenity) => (
                    <div key={amenity} className="flex items-center text-slate-600 text-sm">
                       <Check className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                       <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
            <div className="bg-white border border-border shadow-xl p-8 rounded-none">
              <h3 className="text-2xl font-serif mb-6 text-slate-900">Bảng giá & Gói đặt</h3>
              
              <div className="space-y-4 mb-8">
                 {pricing?.firstTwoHours && (
                   <div className="flex justify-between items-center py-3 border-b border-slate-100 italic">
                      <span className="text-slate-600">2 giờ đầu</span>
                      <span className="font-medium text-slate-900">{pricing.firstTwoHours.toLocaleString()} VND</span>
                   </div>
                 )}
                 {pricing?.additionalHour && (
                   <div className="flex justify-between items-center py-3 border-b border-slate-100 italic">
                      <span className="text-slate-600">Giờ tiếp theo</span>
                      <span className="font-medium text-slate-900">{pricing.additionalHour.toLocaleString()} VND</span>
                   </div>
                 )}
                 {pricing?.overnight && (
                   <div className="flex justify-between items-center py-3 border-b border-slate-100 italic">
                      <span className="text-slate-600">Qua đêm</span>
                      <span className="font-medium text-slate-900">{pricing.overnight.toLocaleString()} VND</span>
                   </div>
                 )}
                 {pricing?.daily && (
                   <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Cả ngày</span>
                      <span className="text-xl font-bold text-primary">{pricing.daily.toLocaleString()} VND</span>
                   </div>
                 )}
              </div>

              <Link 
                href={`/booking?room=${room.id}`}
                className="block w-full text-center bg-primary text-primary-foreground py-4 font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mb-4"
              >
                Đặt phòng này
              </Link>

              <div className="space-y-4 pt-6">
                 <div className="flex gap-3 text-xs text-muted-foreground p-3 bg-slate-50 border border-slate-100">
                    <Info className="w-4 h-4 text-primary flex-shrink-0" />
                    <p>Giá có thể thay đổi tùy theo dịp lễ và các ngày đặc biệt. Vui lòng liên hệ trực tiếp để được hỗ trợ tốt nhất.</p>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Đảm bảo giá tốt nhất
                 </div>
              </div>
            </div>

            {/* Branch Card Small */}
            {branchData && (
               <div className="bg-slate-900 text-white p-6 rounded-none">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Vị trí</p>
                  <h4 className="text-lg font-serif mb-3">{branchData.title}</h4>
                  <p className="text-sm text-slate-300 mb-4 font-light">{branchData.address}</p>
                  <Link href={`/chi-nhanh/${branchData.slug}`} className="text-xs text-primary font-bold hover:underline">
                    Xem thêm phòng tại chi nhánh này
                  </Link>
               </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
