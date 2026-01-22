import { start } from 'repl'

const PROD_URL = 'https://payloadcms-hotel-domain.vercel.app'
const CREDENTIALS = {
  email: 'kanekirito1280@gmail.com',
  password: '123456',
}

const IMAGES = [
  // existing
  {
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070',
    filename: 'hotel-room-luxury.jpg',
    alt: 'Luxury Hotel Room',
  },
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070',
    filename: 'hotel-pool.jpg',
    alt: 'Infinity Pool',
  },
  {
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070',
    filename: 'hotel-resort-view.jpg',
    alt: 'Resort View',
  },
  {
    url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070',
    filename: 'hotel-lobby.jpg',
    alt: 'Hotel Lobby',
  },
  {
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974',
    filename: 'hotel-gym.jpg',
    alt: 'Fitness Center',
  },

  // new additions (approx 15 more)
  {
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025',
    filename: 'hotel-room-cozy.jpg',
    alt: 'Cozy Bedroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070',
    filename: 'hotel-room-suite.jpg',
    alt: 'Executive Suite',
  },
  {
    url: 'https://images.unsplash.com/photo-1590073242678-cfe2f792f3c8?q=80&w=2070',
    filename: 'hotel-bathroom.jpg',
    alt: 'Modern Bathroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070',
    filename: 'hotel-bathroom-tub.jpg',
    alt: 'Bathtub',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    filename: 'hotel-restaurant.jpg',
    alt: 'Fine Dining',
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974',
    filename: 'hotel-bar.jpg',
    alt: 'Poolside Bar',
  },
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070',
    filename: 'hotel-exterior-night.jpg',
    alt: 'Hotel Exterior Night',
  },
  {
    url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2832',
    filename: 'hotel-exterior-day.jpg',
    alt: 'Hotel Exterior Day',
  },
  {
    url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2049',
    filename: 'hotel-resort-aerial.jpg',
    alt: 'Aerial View',
  },
  {
    url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070',
    filename: 'hotel-reception.jpg',
    alt: 'Reception Desk',
  },
  {
    url: 'https://images.unsplash.com/photo-1611762024169-e09647225ac4?q=80&w=2070',
    filename: 'hotel-spa.jpg',
    alt: 'Spa & Wellness',
  },
  {
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070',
    filename: 'hotel-meeting-room.jpg',
    alt: 'Conference Room',
  },
  {
    url: 'https://images.unsplash.com/photo-1583204988085-f5f65f3a0cb8?q=80&w=2014',
    filename: 'hotel-breakfast.jpg',
    alt: 'Breakfast Buffet',
  },
  {
    url: 'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?q=80&w=2070',
    filename: 'hotel-staff.jpg',
    alt: 'Friendly Staff',
  },
  {
    url: 'https://images.unsplash.com/photo-1551918120-9739cb7471c7?q=80&w=2072',
    filename: 'hotel-corridor.jpg',
    alt: 'Hotel Corridor',
  },
]

async function seedMedia() {
  console.log('🚀 Starting Media Seed to Production...')

  // 1. Login
  console.log('🔑 Logging in...')
  const loginRes = await fetch(`${PROD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
  })

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.statusText}`)
  }

  const loginData = await loginRes.json()
  const token = loginData.token
  if (!token) throw new Error('No token received')

  console.log('✅ Login successful!')

  // 2. Process Images
  for (const img of IMAGES) {
    console.log(`Processing ${img.filename}...`)

    try {
      // Download image
      const imgRes = await fetch(img.url)
      if (!imgRes.ok) throw new Error(`Failed to fetch image: ${img.url}`)

      const blob = await imgRes.blob()

      // Create FormData
      const formData = new FormData()
      formData.append('file', blob, img.filename)
      formData.append('alt', img.alt)

      // Upload to Payload
      const uploadRes = await fetch(`${PROD_URL}/api/media`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data', // Let browser/fetch set boundary
          Authorization: `JWT ${token}`,
        },
        body: formData,
      })

      if (uploadRes.ok) {
        console.log(`✅ Uploaded ${img.filename}`)
      } else {
        const err = await uploadRes.json()
        console.error(`❌ Failed to upload ${img.filename}:`, err)
      }
    } catch (e) {
      console.error(`❌ Error with ${img.filename}:`, e)
    }
  }

  console.log('✨ Seeding completed!')
}

seedMedia().catch(console.error)
