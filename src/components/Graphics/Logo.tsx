import React from 'react'
import { Hotel } from 'lucide-react'

const AdminLogo: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px' }}>
            <div style={{ backgroundColor: 'rgba(197, 164, 126, 0.1)', padding: '12px', borderRadius: '50%', marginBottom: '4px' }}>
                <Hotel size={40} color="#c5a47e" strokeWidth={1.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontFamily: 'serif', fontWeight: 'bold', letterSpacing: '0.15em', color: '#c5a47e', textTransform: 'uppercase' }}>
                    Hotel Domain
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '4px' }}>
                    <div style={{ height: '1px', width: '32px', backgroundColor: 'rgba(197, 164, 126, 0.3)' }} />
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#94a3b8', fontWeight: '500' }}>
                        Supreme Excellence
                    </div>
                    <div style={{ height: '1px', width: '32px', backgroundColor: 'rgba(197, 164, 126, 0.3)' }} />
                </div>
            </div>
        </div>
    )
}

export default AdminLogo
