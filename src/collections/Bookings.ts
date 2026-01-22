import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Đặt phòng',
    plural: 'Quản lý Đặt phòng',
  },
  access: {
    create: () => true, // Allow anyone to create bookings
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: [
      'customerName',
      'customerPhone',
      'room',
      'type',
      'checkIn',
      'checkOut',
      'status',
    ],
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Auto-create Order when Admin/Reception creates a Booking
        if (operation === 'create' && doc.room && req.user) {
          try {
            // 1. Fetch Room Price
            const room = await req.payload.findByID({
              collection: 'rooms',
              id: typeof doc.room === 'object' ? doc.room.id : doc.room,
            })

            if (!room || !room.pricing?.hourly) return

            // 2. Fetch Linked Product (to associate with Order)
            const products = await req.payload.find({
              collection: 'products',
              where: {
                room: {
                  equals: typeof doc.room === 'object' ? doc.room.id : doc.room,
                },
              },
              limit: 1,
            })
            const product = products.docs[0]

            // 3. Calculate Duration & Amount
            const checkIn = new Date(doc.checkIn)
            const checkOut = doc.checkOut
              ? new Date(doc.checkOut)
              : new Date(checkIn.getTime() + 2 * 60 * 60 * 1000)

            const hours = Math.max(
              2,
              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)),
            )

            // Simple pricing logic
            const price = room.pricing.hourly
            const total = price * hours

            // 4. Create Paid Order
            await req.payload.create({
              collection: 'orders',
              data: {
                sepayPaymentStatus: 'paid', // Auto-mark as paid
                amount: total,
                currency: 'VND',
                items: [
                  {
                    product: product ? product.id : null,
                    price: price,
                    quantity: hours,
                  },
                ] as any, // Cast to any to avoid outdated TS errors regarding 'price'
                customerName: doc.customerName,
                customerPhone: doc.customerPhone,
                customerEmail: doc.customerEmail,
                note: `Auto-generated from Reception Booking`,

                // Booking Details
                bookingRoom: room.title,
                bookingDuration: `${hours} giờ`,
                checkIn: doc.checkIn,
                checkOut: doc.checkOut,
              },
            })

            console.log(`[AutoOrder] Created paid order for Booking ${doc.id}`)
          } catch (err) {
            console.error('[AutoOrder] Failed to create order:', err)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      options: [
        { label: 'Đang chờ xử lý', value: 'pending' },
        { label: 'Đã xác nhận', value: 'confirmed' },
        { label: 'Đã hủy', value: 'cancelled' },
        { label: 'Hoàn thành', value: 'completed' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Loại đặt phòng',
      options: [
        { label: 'Theo giờ (Hourly)', value: 'hourly' },
        { label: 'Theo ngày (Daily)', value: 'daily' },
      ],
      required: true,
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
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
      label: 'Phòng đặt',
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
      label: 'Thời gian Check-in',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'checkOut',
      type: 'date',
      label: 'Thời gian Check-out',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Tên khách hàng',
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
      label: 'Số điện thoại',
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Ghi chú',
    },
  ],
}
