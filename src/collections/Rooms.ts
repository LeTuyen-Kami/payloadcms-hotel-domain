import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateRoom, revalidateRoomDelete } from './Rooms/hooks/revalidateRoom'

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
      revalidateRoom,
      async ({ doc, req }) => {
        // Sync pricing to linked Products
        const hasPricing =
          doc.pricing?.priceHourlyFirst2Hours ||
          doc.pricing?.priceOvernight ||
          doc.pricing?.priceDaily

        if (hasPricing) {
          console.log(
            `[Sync] Room "${doc.title}" (ID: ${doc.id}) has pricing data. Starting sync...`,
          )
          try {
            const { docs: products } = await req.payload.find({
              collection: 'products',
              draft: true,
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
                  try {
                    // Update Product with new pricing structure
                    // Note: Product schema might need updates if it doesn't support these fields yet,
                    // but for now we map to standard fields we likely have or will standardise.
                    // Assuming Product has generic fields or we map strictly.
                    // Based on previous code, Product had: priceInVND, priceOvernight, priceDaily.
                    // We will map:
                    // priceHourlyFirst2Hours -> priceInVND (Base hourly)
                    // priceOvernight -> priceOvernight
                    // priceDaily -> priceDaily

                    await req.payload.update({
                      collection: 'products',
                      id: product.id,
                      data: {
                        priceInVND: doc.pricing.priceHourlyFirst2Hours,
                        priceInVNDEnabled: true,
                        priceOvernight: doc.pricing.priceOvernight,
                        priceDaily: doc.pricing.priceDaily,
                        // If Product needs more fields like 'nextHour', they need to be added to Product schema too
                        // For now we sync the main ones ensuring basic overlap works.
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
          console.log(`[Sync] Room "${doc.title}" (ID: ${doc.id}) has missing pricing data`)
        }
      },
    ],
    afterDelete: [revalidateRoomDelete],
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
      label: 'Bảng giá (VNĐ)',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'priceHourlyFirst2Hours',
              type: 'number',
              label: 'Giá 2 giờ đầu',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'priceHourlyNextHour',
              type: 'number',
              label: 'Giá mỗi giờ tiếp theo',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'priceOvernight',
              type: 'number',
              label: 'Giá qua đêm (22h - 12h)',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'priceDaily',
              type: 'number',
              label: 'Giá theo ngày (12h - 12h)',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'surchargeEarlyCheckIn',
              type: 'number',
              label: 'Phụ thu Check-in sớm (+20k)',
              admin: { width: '50%' },
            },
            {
              name: 'surchargeLateCheckOut',
              type: 'number',
              label: 'Phụ thu Check-out muộn (+20k)',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'pricingNote',
          type: 'textarea',
          label: 'Ghi chú giá (Hiển thị frontend)',
        },
      ],
    },
    slugField(),
  ],
}
