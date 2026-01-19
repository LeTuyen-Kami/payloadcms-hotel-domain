

import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import React from 'react'

import type { Footer, SiteSetting } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { MapPin, Phone, ExternalLink, Mail } from 'lucide-react'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()
  const siteSettings: SiteSetting = await getCachedGlobal('site-settings', 1)()
  
  const payload = await getPayload({ config: configPromise })
  const { docs: branches } = await payload.find({
    collection: 'branches',
    limit: 10,
  })

  return (
    <footer className="mt-auto bg-[#1a1a1a] text-gray-300 border-t border-[#333]">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-4">
               {/* Use Site Logo if available */}
               {siteSettings.general?.logo && typeof siteSettings.general.logo !== 'string' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={siteSettings.general.logo.url || ''} 
                  alt={siteSettings.general.logo.alt || 'Logo'} 
                  className="h-10 w-auto invert" 
                />
              ) : (
                <Logo className="invert" />
              )}
            </Link>
            <p className="text-sm mb-4">
              {siteSettings.footer?.description || 'Hệ thống khách sạn Cloud9 - Trải nghiệm nghỉ dưỡng đẳng cấp.'}
            </p>
            <div className="space-y-3 mt-6">
                <a href={`tel:${siteSettings.contact?.hotline}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Phone className="w-4 h-4 text-primary group-hover:text-white" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Hotline</span>
                      <span>{siteSettings.contact?.hotline}</span>
                   </div>
                </a>
                <a href={`mailto:${siteSettings.contact?.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Mail className="w-4 h-4 text-primary group-hover:text-white" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Email</span>
                      <span>{siteSettings.contact?.email}</span>
                   </div>
                </a>
            </div>
          </div>

          {/* Dynamic Branches or Single Branch Info */}
          {branches.length > 1 ? (
            branches.map((branch) => (
              <div key={branch.id} className="text-sm">
                 <h4 className="text-white font-bold text-lg mb-4 hover:text-primary transition-colors">
                    <Link href={`/chi-nhanh/${branch.slug}`}>{branch.title}</Link>
                 </h4>
                 <p className="mb-2">{branch.address}</p>
                 <p className="mb-2">
                    <strong>Tel:</strong> <a href={`tel:${branch.phone}`} className="hover:text-primary">{branch.phone}</a>
                 </p>
                 {branch.mapLink && (
                     <a href={branch.mapLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                         Xem bản đồ
                     </a>
                 )}
              </div>
            ))
          ) : branches.length === 1 ? (
            <>
              <div className="text-sm border-l border-slate-800 pl-8">
                 <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Thông tin liên hệ</h4>
                 <div className="space-y-3">
                    <p className="flex items-start gap-2">
                       <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                       {branches[0].address}
                    </p>
                    <p className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-primary shrink-0" />
                       <a href={`tel:${branches[0].phone}`} className="hover:text-primary transition-colors">{branches[0].phone}</a>
                    </p>
                    {branches[0].mapLink && (
                        <a href={branches[0].mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline mt-2">
                           <ExternalLink className="w-4 h-4" />
                           Xem chỉ đường trên Google Maps
                        </a>
                    )}
                 </div>
              </div>
              <div className="text-sm border-l border-slate-800 pl-8">
                 <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Liên kết nhanh</h4>
                 <ul className="space-y-3">
                    <li><Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
                    <li><Link href="/rooms" className="hover:text-primary transition-colors">Danh sách phòng</Link></li>
                    <li><Link href="/booking" className="hover:text-primary transition-colors">Đặt phòng ngay</Link></li>
                 </ul>
              </div>
            </>
          ) : (
             <div className="text-sm">
                <h4 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Liên Kết</h4>
                <ul className="space-y-2">
                   <li><Link href="/" className="hover:text-primary">Trang Chủ</Link></li>
                   <li><Link href="/ve-chung-toi" className="hover:text-primary transition-colors">Về Chúng Tôi</Link></li>
                   <li><Link href="/lien-he" className="hover:text-primary transition-colors">Liên Hệ</Link></li>
                </ul>
             </div>
          )}
        </div>
      </div>
      <div className="bg-[#111] py-4 text-center text-xs text-gray-500">
         <div className="container">
            {siteSettings.footer?.copyright || 'Copyright © 2024 Hotel Cloud 9. All rights reserved.'}
         </div>
      </div>
    </footer>
  )
}
