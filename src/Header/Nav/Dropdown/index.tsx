'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/cn'

interface Branch {
  id: string
  title: string
  slug: string
}

export const NavDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches?limit=10')
        const data = await res.json()
        setBranches(data.docs || [])
      } catch (e) {
        console.error('Failed to fetch branches for dropdown', e)
      }
    }
    fetchBranches()
  }, [])

  if (branches.length <= 1) return null

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-2 group">
        CHI NHÁNH
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute top-full left-0 w-64 bg-white shadow-2xl border-t-2 border-primary transition-all duration-300 origin-top overflow-hidden z-[100]",
        isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
      )}>
        <div className="py-2">
           {branches.map((branch) => (
             <Link 
               key={branch.id} 
               href={`/chi-nhanh/${branch.slug}`}
               className="block px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors border-b border-slate-50 last:border-0"
               onClick={() => setIsOpen(false)}
             >
                <span className="font-semibold block">{branch.title}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Xem phòng & bảng giá</span>
             </Link>
           ))}
        </div>
      </div>
    </div>
  )
}
