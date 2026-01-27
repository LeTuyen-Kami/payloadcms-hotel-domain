import React from 'react'
import { Lock, ShieldCheck, Stars } from 'lucide-react'

const BeforeLogin: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px 24px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '12px',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      marginBottom: '32px',
      textAlign: 'center'
    }}>

      <div style={{
        width: '40px',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(197, 164, 126, 0.3), transparent)',
        borderRadius: '9999px'
      }} />
    </div>
  )
}

export default BeforeLogin
