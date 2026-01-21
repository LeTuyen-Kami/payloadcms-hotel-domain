import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  labels: {
    singular: 'Phòng',
    plural: 'Quản lý Phòng',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        if (doc.pricing?.hourly) {
          console.log(
            `[Sync] Room "${doc.title}" (ID: ${doc.id}) matched pricing.hourly condition: ${doc.pricing.hourly}`,
          )
          try {
            console.log(`[Sync] Searching for products linked to Room ID: ${doc.id}`)
            const { docs: products } = await req.payload.find({
              collection: 'products',
              draft: true, // Include draft products
              where: {
                room: {
                  equals: doc.id,
                },
              },
            })

            console.log(`[Sync] Found ${products.length} products linked to Room ID: ${doc.id}`)

            if (products.length > 0) {
              await Promise.all(
                products.map(async (product) => {
                  console.log(
                    `[Sync] Updating Product ID: ${product.id} with price: ${doc.pricing.hourly}`,
                  )
                  try {
                    await req.payload.update({
                      collection: 'products',
                      id: product.id,
                      data: {
                        priceInVND: doc.pricing.hourly,
                        priceInVNDEnabled: true,
                        priceOvernight: doc.pricing.overnight,
                        priceDaily: doc.pricing.daily,
                      } as any,
                    })
                    console.log(`[Sync] Successfully updated Product ID: ${product.id}`)
                  } catch (updateError) {
                    console.error(`[Sync] Error updating Product ID: ${product.id}`, updateError)
                  }
                }),
              )
            }
          } catch (error) {
            console.error('Error syncing room price to products:', error)
          }
        } else {
          console.log(`[Sync] Room "${doc.title}" (ID: ${doc.id}) has NO pricing.hourly`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên phòng (VD: Standard, Deluxe)',
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: true,
      hasMany: false,
      label: 'Chi nhánh',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả chi tiết',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Thư viện ảnh phòng',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'amenities',
      type: 'select',
      label: 'Tiện ích phòng',
      hasMany: true,
      options: [
        { label: 'Smart TV', value: 'tv' },
        { label: 'AC', value: 'ac' },
        { label: 'Fridge', value: 'fridge' },
        { label: 'Hair Dryer', value: 'hairdryer' },
        { label: 'Wifi', value: 'wifi' },
        { label: 'Bathtub', value: 'bathtub' },
      ],
    },

    {
      name: 'totalStock',
      type: 'number',
      label: 'Tổng số lượng phòng',
      required: true,
      defaultValue: 1,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Bảng giá',
      fields: [
        {
          name: 'hourly',
          type: 'number',
          label: 'Giá 1 giờ',
          required: true,
        },
      ],
    },
    slugField(),
  ],
}
