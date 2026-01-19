'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from './DateTimePicker'
import { cn } from '@/utilities/cn'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronDown, Calendar, MapPin } from 'lucide-react'

type BookingType = 'hourly' | 'overnight' | 'daily'

interface Branch {
  id: string
  title: string
}

export const BookingBar = () => {
  const router = useRouter()
  const [bookingType, setBookingType] = useState<BookingType>('hourly')
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  // Booking Data
  const [checkIn, setCheckIn] = useState<Date>(new Date())
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches?limit=10')
        const data = await res.json()
        const fetchedBranches = data.docs || []
        setBranches(fetchedBranches)
        
        // Default logic: if only 1 branch, select it
        if (fetchedBranches.length === 1) {
            setSelectedBranch(fetchedBranches[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch branches', error)
      } finally {
        setIsLoadingBranches(false)
      }
    }
    fetchBranches()
  }, [])

  const handleBook = () => {
    // Navigate to booking page with query params
    const params = new URLSearchParams({
        branch: selectedBranch,
        type: bookingType,
        checkIn: checkIn.toISOString(),
        ...(checkOut ? { checkOut: checkOut.toISOString() } : {})
    })
    router.push(`/booking?${params.toString()}`)
  }
  
  // Format display string
  const getDisplayTime = () => {
     if (!checkOut) return format(checkIn, 'HH:mm dd/MM', { locale: vi })
     return `${format(checkIn, 'HH:mm dd/MM', { locale: vi })} - ${format(checkOut, 'HH:mm dd/MM', { locale: vi })}`
  }

  return (
    <div className="bg-white text-gray-900 shadow-2xl p-6 -mt-8 relative z-30 mx-auto max-w-6xl border-t-4 border-primary rounded-sm">
      <div className={cn("grid gap-6 items-end", branches.length > 1 ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3")}>
        
        {/* Booking Type */}
        <div className="relative group">
          <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Loại đặt phòng</label>
          <div className="relative">
              <select 
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as BookingType)}
                className="w-full p-4 border border-gray-200 bg-gray-50 text-gray-900 text-[13px] font-bold appearance-none cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider"
              >
                <option value="hourly">THEO GIỜ</option>
                <option value="overnight">QUA ĐÊM</option>
                <option value="daily">THEO NGÀY</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Branch Selection - Only show if multiple branches exist */}
        {branches.length > 1 && (
            <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Chi nhánh</label>
            <div className="relative">
                <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full p-4 border border-gray-200 bg-gray-50 text-gray-900 text-[13px] font-bold appearance-none cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider"
                >
                    <option value="">CHỌN CHI NHÁNH</option>
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.title.toUpperCase()}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            </div>
        )}

        {/* Date Picker Trigger (Unified Check-in/Check-out Action) */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Nhận phòng - Trả phòng</label>
          <button 
             onClick={() => setShowDatePicker(!showDatePicker)}
             className="w-full p-4 border border-gray-200 bg-gray-50 text-gray-900 text-left flex items-center justify-between hover:border-primary transition-colors group"
          >
             <span className="text-sm font-bold truncate">{getDisplayTime()}</span>
             <Calendar className="w-4 h-4 text-gray-400 group-hover:text-primary flex-shrink-0 ml-2" />
          </button>

          {showDatePicker && (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <DateTimePicker 
                    bookingType={bookingType}
                    onApply={(start, end) => {
                        setCheckIn(start)
                        setCheckOut(end)
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            </>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-0">Đặt ngay</label>
          <Button onClick={handleBook} className="w-full bg-primary text-white hover:bg-[#b08d66] font-bold py-4 uppercase tracking-wider text-sm h-auto rounded-none transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Đặt Phòng Ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
