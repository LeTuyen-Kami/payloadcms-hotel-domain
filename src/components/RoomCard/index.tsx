import React from 'react'
import Link from 'next/link'
import type { Room, Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

export const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  const { title, gallery, amenities, pricing, slug } = room
  const mainImage = gallery?.[0]?.image as Media | undefined

  return (
    <div className="group bg-card text-card-foreground rounded-none overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border/50 relative">
      <div className="relative h-64 w-full overflow-hidden">
        {mainImage && (
          <MediaComponent resource={mainImage} fill imgClassName="object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute top-4 left-4 z-10">
           <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 text-xs uppercase tracking-widest font-semibold">
              Còn phòng
           </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-serif font-medium mb-3 group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
              {amenity}
            </span>
          ))}
          {amenities && amenities.length > 3 && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5">
               +{amenities.length - 3} tiện ích khác
            </span>
          )}
        </div>

        <div className="flex items-end justify-between mb-6">
           <div>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">Giá từ</p>
              <p className="text-xl font-medium text-primary">
                {pricing?.firstTwoHours ? `${pricing.firstTwoHours.toLocaleString()} VND` : 'Liên hệ'}
              </p>
           </div>
           <p className="text-xs text-muted-foreground italic">/ 2 giờ</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Link 
              href={`/rooms/${slug}`} 
              className="text-center border border-primary text-primary py-2 text-sm hover:bg-primary hover:text-white transition-all duration-300"
            >
              Chi tiết
            </Link>
            <Link 
              href={`/booking?room=${room.id}`} 
              className="text-center bg-primary text-primary-foreground py-2 text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Đặt ngay
            </Link>
        </div>
      </div>
    </div>
  )
}
