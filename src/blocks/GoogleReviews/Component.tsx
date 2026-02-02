'use client'
import React, { useEffect } from 'react'
import type { Page } from '@/payload-types'

type GoogleReviewsBlockType = Extract<Page['layout'][number], { blockType: 'googleReviewsBlock' }>

export const GoogleReviewsBlockComponent: React.FC<GoogleReviewsBlockType> = ({ embedCode }) => {
    useEffect(() => {
        if (!embedCode) return

        // Create a temporary element to parse scripts
        const div = document.createElement('div')
        div.innerHTML = embedCode
        const scripts = Array.from(div.querySelectorAll('script'))

        const scriptElements: HTMLScriptElement[] = []

        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value)
            })
            newScript.innerHTML = oldScript.innerHTML
            document.body.appendChild(newScript)
            scriptElements.push(newScript)
        })

        return () => {
            scriptElements.forEach((script) => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script)
                }
            })
        }
    }, [embedCode])

    // Filter out script tags from the displayed HTML to avoid visual artifacts or double rendering
    const htmlContent = embedCode?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') || ''

    return (
        <section className="bg-slate-50 py-24">
            <div className="container">
                <div
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </section>
    )
}
