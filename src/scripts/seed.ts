import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({
  path: path.resolve(dirname, '../../.env'),
})

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const ARTIFACTS_DIR = '/Users/letuyen/.gemini/antigravity/brain/7d95c9e6-9fa1-4db0-9aa4-ccb5363f9dc1'

// List of generated images based on earlier tool calls
const IMAGE_FILES = [
  { name: 'hotel_lobby_luxury.png', path: path.join(ARTIFACTS_DIR, 'hotel_lobby_luxury_1768495633088.png'), alt: 'Sảnh khách sạn sang trọng' },
  { name: 'luxury_standard_room.png', path: path.join(ARTIFACTS_DIR, 'luxury_standard_room_1768495651361.png'), alt: 'Phòng tiêu chuẩn ấm cúng' },
  { name: 'deluxe_room_interior.png', path: path.join(ARTIFACTS_DIR, 'deluxe_room_interior_1768495668786.png'), alt: 'Nội thất phòng Deluxe hiện đại' },
  { name: 'luxury_suite_bathroom.png', path: path.join(ARTIFACTS_DIR, 'luxury_suite_bathroom_1768495683976.png'), alt: 'Phòng tắm Suite đẳng cấp' },
  { name: 'hotel_exterior_night.png', path: path.join(ARTIFACTS_DIR, 'hotel_exterior_night_1768495701022.png'), alt: 'Toàn cảnh khách sạn về đêm' },
  { name: 'luxury_vip_room_king_bed.png', path: path.join(ARTIFACTS_DIR, 'luxury_vip_room_king_bed_1768495721535.png'), alt: 'Phòng VIP với giường King Size' },
]

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  payload.logger.info('Starting premium media seed and full data restoration...')

  // 1. UPLOAD MEDIA
  const mediaMap: Record<string, string> = {}
  
  for (const img of IMAGE_FILES) {
    try {
      if (fs.existsSync(img.path)) {
        const fileData = fs.readFileSync(img.path)
        const media = await payload.create({
          collection: 'media',
          data: { alt: img.alt },
          file: {
            data: fileData,
            mimetype: 'image/png',
            name: img.name,
            size: fileData.length,
          } as any,
          context: { disableRevalidate: true },
        })
        mediaMap[img.name.split('.')[0]] = media.id
        payload.logger.info(`Uploaded: ${img.name}`)
      } else {
        payload.logger.warn(`File not found: ${img.path}`)
      }
    } catch (e) {
      payload.logger.error(`Failed to upload ${img.name}`, (e as any).message)
    }
  }

  // 2. DATA RESET
  payload.logger.info('Resetting data...')
  await Promise.all([
    payload.delete({ collection: 'rooms', where: { id: { exists: true } }, context: { disableRevalidate: true } }),
    payload.delete({ collection: 'branches', where: { id: { exists: true } }, context: { disableRevalidate: true } }),
    payload.delete({ collection: 'testimonials', where: { id: { exists: true } }, context: { disableRevalidate: true } }),
    payload.delete({ collection: 'pages', where: { id: { exists: true } }, context: { disableRevalidate: true } }),
  ])

  // 3. CREATE BRANCH
  const mainBranch = await payload.create({
    collection: 'branches',
    data: {
      title: 'Cloud 9 Luxury Gò Vấp',
      slug: 'cloud9-go-vap',
      address: 'Số 123 Đường An Nhơn, Phường 17, Quận Gò Vấp, TP. Hồ Chí Minh',
      phone: '0901 234 567',
      mapLink: 'https://maps.app.goo.gl/hotel-location',
      image: mediaMap['hotel_lobby_luxury'] || mediaMap['hotel_exterior_night'],
    } as any,
    context: { disableRevalidate: true },
  })

  // 4. CREATE ROOMS
  const roomTypes = [
    {
      title: 'Phòng Standard - Tiêu chuẩn',
      slug: 'room-standard',
      image: 'luxury_standard_room',
      description: 'Phòng tiêu chuẩn ấm cúng, phù hợp cho các cặp đôi cần không gian riêng tư và yên tĩnh. Trang bị đầy đủ tiện nghi cơ bản.',
      amenities: ['tv', 'ac', 'wifi'],
      pricing: { firstTwoHours: 180000, additionalHour: 40000, overnight: 450000, daily: 800000 }
    },
    {
      title: 'Phòng Deluxe - Sang trọng',
      slug: 'room-deluxe',
      image: 'deluxe_room_interior',
      description: 'Không gian rộng rãi hơn với nội thất Gỗ cao cấp, mang lại cảm giác ấm áp và sang trọng bậc nhất.',
      amenities: ['tv', 'ac', 'wifi', 'fridge'],
      pricing: { firstTwoHours: 250000, additionalHour: 50000, overnight: 550000, daily: 1000000 }
    },
    {
      title: 'Phòng Suite - Cao cấp',
      slug: 'room-suite',
      image: 'luxury_suite_bathroom',
      description: 'Trải nghiệm đẳng cấp với bồn tắm sục và view thành phố cực đẹp. Lựa chọn hoàn hảo cho những dịp đặc biệt.',
      amenities: ['tv', 'ac', 'wifi', 'fridge', 'bathtub', 'hairdryer'],
      pricing: { firstTwoHours: 350000, additionalHour: 70000, overnight: 750000, daily: 1400000 }
    },
    {
      title: 'Phòng VIP - Đặc biệt',
      slug: 'room-vip',
      image: 'luxury_vip_room_king_bed',
      description: 'Căn phòng lộng lẫy nhất tại Cloud 9 với thiết kế phong cách Châu Âu, giường King-size và dịch vụ đi kèm cao cấp.',
      amenities: ['tv', 'ac', 'wifi', 'fridge', 'bathtub', 'hairdryer'],
      pricing: { firstTwoHours: 500000, additionalHour: 100000, overnight: 1000000, daily: 1800000 }
    }
  ]

  for (const room of roomTypes) {
    const mainImageId = mediaMap[room.image]
    await payload.create({
      collection: 'rooms',
      data: {
        title: room.title,
        slug: room.slug,
        description: room.description,
        amenities: room.amenities,
        pricing: room.pricing,
        branch: mainBranch.id,
        gallery: mainImageId ? [{ image: mainImageId }] : [],
      } as any,
      context: { disableRevalidate: true },
    })
  }

  // 5. TESTIMONIALS
  const testimonialsData = [
    { name: 'Hoàng Nam', content: 'Phòng rất sạch sẽ, decor đẹp như trên hình. Nhân viên nhiệt tình, chu đáo.', rating: 5, source: 'google' },
    { name: 'Minh Thư', content: 'Thích nhất bồn tắm và dịch vụ setup quà kỷ niệm. Rất lãng mạn!', rating: 5, source: 'facebook' },
    { name: 'Anh Tuấn', content: 'Giá cả hợp lý, vị trí dễ tìm. Chắc chắn sẽ quay lại nhiều lần.', rating: 4, source: 'website' }
  ]

  for (const t of testimonialsData) {
    await payload.create({
      collection: 'testimonials',
      data: { ...t, image: mediaMap['hotel_lobby_luxury'] } as any,
      context: { disableRevalidate: true },
    })
  }

  // 6. CREATE PAGES (Including HOME)
  payload.logger.info('Creating pages...')
  
  // HOME PAGE
  const homePage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      hero: {
        type: 'highImpact',
        richText: {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'heading',
                tag: 'h1',
                children: [{ type: 'text', text: 'Hotel Cloud 9' }]
              },
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Đẳng cấp nghỉ dưỡng giữa lòng thành phố' }]
              }
            ]
          }
        } as any,
        media: mediaMap['hotel_exterior_night'],
      },
      layout: [
        {
          blockType: 'roomsBlock',
          title: 'Khám Phá Các Loại Phòng',
        },
        {
          blockType: 'testimonialsBlock',
          title: 'Khách Hàng Nói Gì Về Chúng Tôi',
        }
      ] as any,
    } as any,
    context: { disableRevalidate: true },
  })

  const contactPage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Liên hệ',
      slug: 'lien-he',
      _status: 'published',
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: {
                root: {
                  type: 'root',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [
                    {
                      type: 'heading',
                      tag: 'h2',
                      children: [{ type: 'text', text: 'Liên hệ với chúng tôi' }],
                    },
                  ],
                },
              } as any,
            },
          ],
        },
      ] as any,
    } as any,
    context: { disableRevalidate: true },
  })

  const pricePage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Bảng giá',
      slug: 'bang-gia',
      _status: 'published',
      layout: [
        {
          blockType: 'pricing',
          title: 'Bảng Giá Dịch Vụ Niêm Yết',
          introContent: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Cloud 9 cam kết minh bạch về giá cả. Dưới đây là bảng giá chi tiết cho từng loại phòng theo các khung giờ khác nhau để bạn dễ dàng lựa chọn.',
                    },
                  ],
                },
              ],
            },
          } as any,
        },
      ] as any,
    } as any,
    context: { disableRevalidate: true },
  })

  const aboutPage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Giới thiệu',
      slug: 've-chung-toi',
      _status: 'published',
      layout: [
        {
          blockType: 'about',
          title: 'Về Cloud9 Hotel',
          description: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Được thành lập từ năm 2019, Khách sạn Cloud 9 tự hào là một trong những điểm đến hàng đầu tại khu vực, mang đến sự kết hợp hoàn hảo giữa tiện nghi hiện đại và sự riêng tư tuyệt đối.',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Tọa lạc tại vị trí thuận lợi, chúng tôi không chỉ cung cấp không gian nghỉ dưỡng lý tưởng mà còn chú trọng vào chất lượng dịch vụ chuẩn khách sạn từ khâu đón tiếp đến từng chi tiết nhỏ nhất trong phòng.',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Với thiết kế sang trọng, tinh tế và đầy đủ các dịch vụ đi kèm, Cloud 9 cam kết mang lại trải nghiệm nghỉ ngơi thư giãn và đáng nhớ nhất cho mọi khách hàng.',
                    },
                  ],
                },
              ],
            },
          } as any,
          images: {
            verticalImage: mediaMap['luxury_vip_room_king_bed'],
            horizontalImage1: mediaMap['hotel_lobby_luxury'],
            horizontalImage2: mediaMap['deluxe_room_interior'],
          },
          enableLink: true,
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
            label: 'LIÊN HỆ VỚI CHÚNG TÔI',
          },
        },
      ] as any,
    } as any,
    context: { disableRevalidate: true },
  })

  // 7. GLOBAL SETTINGS
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      general: {
        siteTitle: 'Hotel Cloud 9 - Luxury & Privacy',
        logo: mediaMap['hotel_lobby_luxury'],
      },
      contact: {
        hotline: '0901 234 567',
        email: 'info@hotelcloud9.vn',
        address: '123 An Nhơn, Gò Vấp, HCM',
      }
    } as any,
    context: { disableRevalidate: true },
  })

  // 8. UPDATE HEADER
  payload.logger.info('Updating Header navigation...')
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: homePage.id,
            },
            label: 'Trang chủ',
          },
        },
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: aboutPage.id,
            },
            label: 'Giới thiệu',
          },
        },
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: pricePage.id,
            },
            label: 'Bảng giá',
          },
        },
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: contactPage.id,
            },
            label: 'Liên hệ',
          },
        },
      ],
    } as any,
    context: { disableRevalidate: true },
  })

  payload.logger.info('Premium seeding and Home Page restoration complete!')
  process.exit(0)
}

seed()
