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
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="container py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">
            {title}
          </h2>
          <div className="h-1.5 w-24 bg-blue-600 rounded-full" />
          {introContent && (
            <div className="mt-4 prose prose-lg dark:prose-invert max-w-none text-gray-600">
              <RichText data={introContent} enableGutter={false} />
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-gray-700">Loại phòng</th>
                  <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-gray-700 text-center">Giá 1 giờ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rooms as Room[]).map((room) => (
                  <tr key={room.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold text-gray-900 text-lg">{room.title}</div>
                      {room.description && (
                         <div className="text-sm text-gray-500 mt-1 line-clamp-1">{room.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-6 text-center text-blue-600 font-semibold italic text-lg whitespace-nowrap">
                      {formatCurrency(room.pricing?.hourly as number | undefined)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 p-6 rounded-xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="text-blue-900 font-medium italic">
                * Giá trên đã bao gồm thuế và phí dịch vụ. Liên hệ hotline để đặt phòng nhanh nhất.
            </div>
            <a href="tel:0901234567" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-shadow shadow-md active:scale-95">
                GỌI ĐẶT PHÒNG
            </a>
        </div>
      </div>
    </div>
  )
}
