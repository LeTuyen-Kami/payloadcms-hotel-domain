import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Page, Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/utilities/cn'

type TestimonialsBlockType = Extract<Page['layout'][number], { blockType: 'testimonialsBlock' }>

export const TestimonialsBlockComponent: React.FC<TestimonialsBlockType> = async ({ title, limit }) => {
  const payload = await getPayload({ config: configPromise })
  
  const { docs: testimonials } = await payload.find({
    collection: 'testimonials',
    limit: limit || 3,
  })

  return (
    <section className="py-24 bg-slate-50">
        <div className="container">
            {title && <h2 className="text-4xl font-serif text-center mb-16 text-slate-900">{title}</h2>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((item) => (
                    <div key={item.id} className="bg-white p-8 shadow-sm border border-slate-100 relative group hover:shadow-xl transition-all duration-500">
                         {/* Quote Icon */}
                         <Quote className="w-10 h-10 text-primary absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity" />
                         
                         <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-50">
                                {item.image && typeof item.image === 'object' && (
                                     <MediaComponent resource={item.image} fill imgClassName="object-cover" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-slate-900">{item.name}</h4>
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={cn(
                                                "w-3 h-3", 
                                                i < (item.rating || 5) ? "fill-primary text-primary" : "text-slate-200"
                                            )} 
                                        />
                                    ))}
                                </div>
                            </div>
                         </div>
                         
                         <p className="text-slate-600 italic font-light leading-relaxed">"{item.content}"</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}
