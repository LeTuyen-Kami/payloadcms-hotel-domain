import React from 'react'
import { Hotel } from 'lucide-react'

const AdminIcon: React.FC = () => {
    return (
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#c5a47e] to-[#b3936d] flex items-center justify-center shadow-md border border-[#c5a47e]/20 transition-transform hover:scale-105">
            <Hotel className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
    )
}

export default AdminIcon
