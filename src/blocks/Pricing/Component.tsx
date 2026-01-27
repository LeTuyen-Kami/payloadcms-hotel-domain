import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { PricingBlock as PricingBlockProps, Room } from '@/payload-types'

export const PricingBlock: React.FC<PricingBlockProps> = async (props) => {
  const { title, introContent } = props

  const payload = await getPayload({ config: configPromise })
  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    limit: 100,
  })

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
    }).format(amount) + 'đ'
  }

  return (
    <div className="container py-20 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Dịch vụ lưu trú</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a]">
            {title}
          </h2>
          <div className="h-1 w-20 bg-primary mt-2" />
          {introContent && (
            <div className="mt-6 max-w-2xl text-slate-500 leading-relaxed">
              <RichText data={introContent} enableGutter={false} />
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-2xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-900">Loại phòng</th>
                  <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-900 text-center bg-slate-100/50">2 giờ đầu</th>
                  <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-900 text-center">Giờ tiếp theo</th>
                  <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-900 text-center bg-slate-100/50">Qua đêm</th>
                  <th className="px-6 py-6 text-xs font-bold uppercase tracking-widest text-slate-900 text-center border-l">Theo ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(rooms as Room[]).map((room) => (
                  <tr key={room.id} className="hover:bg-primary/2 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-serif text-xl text-slate-900 group-hover:text-primary transition-colors">{room.title}</div>
                      {room.description && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1 italic font-light">{room.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-slate-900 bg-slate-50/30">
                      {formatCurrency(room.pricing?.priceHourlyFirst2Hours)}
                    </td>
                    <td className="px-6 py-6 text-center text-slate-600 font-medium">
                      +{formatCurrency(room.pricing?.priceHourlyNextHour)}
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-primary bg-slate-50/30">
                      {formatCurrency(room.pricing?.priceOvernight)}
                    </td>
                    <td className="px-6 py-6 text-center font-bold text-slate-900 border-l">
                      {formatCurrency(room.pricing?.priceDaily)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-900">Quy định thời gian:</h4>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span><strong>Qua đêm:</strong> Từ 22:00h đến 12:00h hôm sau.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span><strong>Theo ngày:</strong> Từ 12:00h đến 12:00h hôm sau.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 text-white flex flex-col items-center md:items-start justify-between gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Hỗ trợ đặt phòng 24/7</p>
              <p className="text-xl font-serif">Giá trên đã bao gồm thuế và phí dịch vụ.</p>
            </div>
            <a href="tel:0901234567" className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-[#b08d66] transition-all shadow-xl hover:shadow-primary/20 text-center uppercase tracking-widest text-sm">
              Gọi ngay: 090 123 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
