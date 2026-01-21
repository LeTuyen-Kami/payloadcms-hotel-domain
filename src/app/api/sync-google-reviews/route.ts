import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Get Settings
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    const placeId = settings?.googleMaps?.placeId
    const apiKey = settings?.googleMaps?.apiKey

    if (!placeId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing Place ID or API Key in Site Settings' },
        { status: 400 },
      )
    }

    // 2. Fetch Google Reviews
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}&language=vi`
    const googleRes = await fetch(url)
    const googleData = await googleRes.json()

    if (googleData.status !== 'OK') {
      console.error('Google API Error:', googleData)
      return NextResponse.json(
        { error: `Google API Error: ${googleData.status} - ${googleData.error_message || ''}` },
        { status: 500 },
      )
    }

    const reviews = googleData.result?.reviews || []
    let addedCount = 0

    // 3. Upsert into Testimonials
    for (const review of reviews) {
      // Check if review already exists (by unique properties, e.g. snippet content + author name)
      const existing = await payload.find({
        collection: 'testimonials',
        where: {
          and: [{ name: { equals: review.author_name } }, { content: { equals: review.text } }],
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        // Add new review
        await payload.create({
          collection: 'testimonials',
          data: {
            name: review.author_name,
            content: review.text,
            rating: review.rating,
            source: 'google',
            // image: review.profile_photo_url // We skip image upload for now to keep it simple
          },
        })
        addedCount++
      }
    }

    return NextResponse.json({ success: true, count: addedCount })
  } catch (error: any) {
    console.error('Error syncing reviews:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
