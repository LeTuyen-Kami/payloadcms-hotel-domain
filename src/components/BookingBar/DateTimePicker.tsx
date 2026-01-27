'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addHours, setHours, setMinutes } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, ArrowRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/cn'

interface DateTimePickerProps {
    bookingType: 'hourly' | 'daily' | 'overnight'
    onApply: (start: Date, end: Date | null, duration?: number) => void
    onClose: () => void
    label?: string
    initialDate?: Date
    initialDuration?: number
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ bookingType, onApply, onClose, label, initialDate, initialDuration }) => {
    const [currentMonth, setCurrentMonth] = useState(initialDate || new Date())

    // Date selection states
    const [startDay, setStartDay] = useState<Date>(initialDate || new Date()) // Check-in day (00:00)
    const [endDay, setEndDay] = useState<Date | null>(null) // Check-out day (Daily mode only)

    // Init time from initialDate
    // Init time from initialDate
    const [selectedTime, setSelectedTime] = useState<string>(() => {
        if (bookingType === 'overnight') {
            // Default overnight time
            return '22:00'
        }
        if (initialDate) {
            let h = initialDate.getHours()
            let m = initialDate.getMinutes()

            if (bookingType === 'hourly') {
                if (h < 12) return '12:00'
                if (h > 22) return '12:00'

                // Snap logic: :00 or :30
                if (m < 15) {
                    m = 0
                } else if (m < 45) {
                    m = 30
                } else {
                    h += 1
                    m = 0
                }

                // Re-check constraints after snapping
                if (h > 22 || h < 12) return '12:00'

                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            }
            return format(initialDate, 'HH:mm')
        }
        return '12:00'
    })
    const [duration, setDuration] = useState<number>(initialDuration || 2) // Hourly duration

    // Reset endDay when type changes
    useEffect(() => {
        if (bookingType !== 'daily') setEndDay(null)
        if (bookingType === 'overnight') setSelectedTime('22:00')
    }, [bookingType])

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Time slots logic...
    const timeSlots = []
    for (let i = 0; i < 24; i++) {
        const hour = i
        if (bookingType === 'hourly' && (hour > 22 || hour < 12)) continue

        if (bookingType === 'overnight' && hour > 12) continue;

        timeSlots.push(`${i.toString().padStart(2, '0')}:00`)
        if (bookingType !== 'overnight') {
            if (bookingType === 'hourly' && hour >= 22) continue
            timeSlots.push(`${i.toString().padStart(2, '0')}:30`)
        } else {
            if (hour >= 12) continue;
            timeSlots.push(`${i.toString().padStart(2, '0')}:30`)
        }
    }

    const durationSlots = useMemo(() => {
        if (bookingType === 'hourly') {
            //chỉ được chọn khoảng từ 12h trưa đến 24h, và min duration phải là 2h, cho nên durationSlot sẽ động dựa theo thời gian nhận phòng đã chọn.
            const h = selectedTime.split(':')[0]
            const m = selectedTime.split(':')[1]
            const maxHour = 24 - Number(h) - (m === '30' ? 1 : 0);
            const _durationSlots = [];
            for (let i = 2; i <= maxHour; i++) {
                _durationSlots.push(i);
            }
            return _durationSlots;

        }
        return [2, 3, 4, 5, 6, 7, 8]
    }, [bookingType, selectedTime])

    useEffect(() => {
        if (durationSlots?.includes(duration)) return;
        setDuration(durationSlots[0]);
    }, [durationSlots])



    const handleDayClick = (day: Date) => {
        if (bookingType === 'daily') {
            if (!startDay || (startDay && endDay)) {
                // Reset start date
                setStartDay(day)
                setEndDay(null)
            } else if (day > startDay) {
                // Set end date
                setEndDay(day)
            } else {
                // If clicked earlier than start day, update start day
                setStartDay(day)
            }
        } else {
            // Hourly/Overnight: just single day
            setStartDay(day)
        }
    }

    const calculateOvernightCheckout = (checkInDate: Date) => {
        const h = checkInDate.getHours()
        // If check-in is early morning (00:00 - 12:00), checkout is SAME DAY 12:00
        if (h <= 12) {
            return setMinutes(setHours(checkInDate, 12), 0)
        }
        // If check-in is afternoon/evening (13:00 - 23:00), checkout is NEXT DAY 12:00
        const nextDay = addHours(checkInDate, 24)
        return setMinutes(setHours(nextDay, 12), 0)
    }

    const handleApply = () => {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        // Construct checkin datetime
        const start = setMinutes(setHours(startDay, hours), minutes)

        let end = null
        if (bookingType === 'hourly') {
            end = addHours(start, duration)
            onApply(start, end, duration)
        } else if (bookingType === 'overnight') {
            end = calculateOvernightCheckout(start)
            onApply(start, end)
        } else {
            // Daily
            const effectiveEndDay = endDay || addHours(startDay, 24) // Default 1 day if not selected
            end = setMinutes(setHours(effectiveEndDay, 12), 0) // Checkout 12:00
            onApply(start, end)
        }
        onClose()
    }

    // Calculate generic check out preview
    const getCheckoutPreview = () => {
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const start = setMinutes(setHours(startDay, hours), minutes)

        if (bookingType === 'hourly') {
            const end = addHours(start, duration)
            return format(end, 'HH:mm dd/MM', { locale: vi })
        }
        if (bookingType === 'overnight') {
            const end = calculateOvernightCheckout(start)
            return format(end, 'HH:mm dd/MM', { locale: vi })
        }
        if (bookingType === 'daily') {
            const effectiveEndDay = endDay || addHours(startDay, 24)
            return `12:00 ${format(effectiveEndDay, 'dd/MM', { locale: vi })}`
        }
        return '...'
    }

    const getDurationPreview = () => {
        if (bookingType === 'hourly') return `${duration} giờ`
        if (bookingType === 'overnight') {
            return `Đến 12:00 trưa mai`
        }
        if (bookingType === 'daily') {
            if (!endDay) return '1 ngày'
            const diffTime = Math.abs(endDay.getTime() - startDay.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} ngày`
        }
        return ''
    }

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-0 w-[calc(100vw-2rem)] md:w-[800px] flex flex-col md:flex-row overflow-hidden absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
            {/* Left Pane: Calendar */}
            <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="font-bold text-gray-800 capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                    </div>
                    <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-2 text-center">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const isTodayDate = isToday(day)

                        // Selection logic
                        const isStart = isSameDay(day, startDay)
                        const isEnd = endDay && isSameDay(day, endDay)
                        const isInRange = bookingType === 'daily' && startDay && endDay && day > startDay && day < endDay

                        const isSelected = isStart || isEnd

                        const isBeforeToday = day < new Date(new Date().setHours(0, 0, 0, 0))
                        const isOvernightRestricted = bookingType === 'overnight' && isToday(day)
                        const isDisabled = isBeforeToday || isOvernightRestricted

                        return (
                            <button
                                type="button"
                                key={idx}
                                disabled={isDisabled}
                                onClick={() => !isDisabled && handleDayClick(day)}
                                className={cn(
                                    "h-10 w-10 text-sm rounded-full flex items-center justify-center transition-all relative z-10",
                                    !isCurrentMonth && "text-gray-300",
                                    isCurrentMonth && "text-gray-700 hover:bg-gray-100",
                                    isDisabled && "text-gray-200 cursor-not-allowed hover:bg-transparent",
                                    isInRange && "bg-primary/20",
                                    isSelected && "bg-primary text-white hover:bg-primary"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Right Pane: Time & Layout */}
            <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 text-gray-800">
                    <ArrowRight className="w-5 h-5 bg-gray-100 rounded p-1" />
                    <span className="font-bold">Giờ nhận phòng</span>
                </div>

                {/* Time Slots */}
                <div className="mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {timeSlots.map(time => (
                            <button
                                type="button"
                                key={time}
                                onClick={() => {
                                    setSelectedTime(time);
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-all",
                                    selectedTime === time
                                        ? "border-primary text-primary bg-primary/5 font-bold"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Controls - Always show duration info, but controls specific to type */}
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-4 text-gray-800">
                        <Clock className="w-5 h-5 bg-gray-100 rounded p-1" />
                        <span className="font-bold">Thời gian sử dụng</span>
                    </div>

                    {bookingType === 'hourly' ? (
                        <div className="flex gap-2 flex-wrap">
                            {durationSlots.map(h => (
                                <button
                                    type="button"
                                    key={h}
                                    onClick={() => setDuration(h)}
                                    className={cn(
                                        "w-16 py-2 rounded-lg border text-sm transition-all",
                                        duration === h
                                            ? "border-primary text-primary bg-primary/5 font-bold"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    )}
                                >
                                    {h} GIỜ
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium">
                            {getDurationPreview()}
                        </div>
                    )}
                </div>

                {/* Check Out Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <ArrowRight className="w-4 h-4" />
                        Trả phòng (dự kiến)
                    </div>
                    <div className="font-bold text-gray-800">{getCheckoutPreview()}</div>
                </div>

                <Button type="button" onClick={handleApply} className="w-full bg-[#1a4b6e] hover:bg-[#153d5a] text-white py-6 text-lg font-bold uppercase rounded-lg">
                    ÁP DỤNG
                </Button>
            </div>
        </div>
    )
}
