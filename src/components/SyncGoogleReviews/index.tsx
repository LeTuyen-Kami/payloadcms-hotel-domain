'use client'

import React, { useState } from 'react'

export default function SyncGoogleReviews() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSync = async () => {
        setLoading(true)
        setStatus('idle')
        setMessage('')

        try {
            const res = await fetch('/api/sync-google-reviews', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Sync failed')
            }

            setStatus('success')
            setMessage(`Successfully synced ${data.count} reviews!`)
        } catch (err: any) {
            console.error(err)
            setStatus('error')
            setMessage(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="field-type date">
            <label className="field-label">Sync Actions</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    type="button"
                    onClick={handleSync}
                    disabled={loading}
                    className="btn btn--style-primary"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'var(--theme-elevation-500)',
                        color: 'var(--theme-elevation-0)',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        borderRadius: '4px'
                    }}
                >
                    {loading ? 'Syncing...' : 'Sync Google Reviews Now'}
                </button>

                {status === 'success' && <span style={{ color: 'green' }}>✓ {message}</span>}
                {status === 'error' && <span style={{ color: 'red' }}>✗ {message}</span>}
            </div>
            <p style={{ marginTop: '5px', fontSize: '13px', color: '#666' }}>
                This will fetch the latest 5 reviews from Google Maps and save them to Testimonials.
            </p>
        </div>
    )
}
