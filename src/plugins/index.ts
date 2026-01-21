import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { fields, formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  importExportPlugin({
    collections: [
      { slug: 'pages' },
      { slug: 'posts' },
      { slug: 'categories' },
      { slug: 'rooms' },
      { slug: 'branches' },
      { slug: 'bookings' },
      { slug: 'testimonials' },
      { slug: 'media' },
    ],
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess: ({ req }) => !!req.user,
      adminOrPublishedStatus: ({ req }) => !!req.user,
      isAdmin: ({ req }) => !!req.user,
      isDocumentOwner: ({ req }) => !!req.user,
      publicAccess: () => true,
    },
    customers: {
      slug: 'users',
    },
    currencies: {
      defaultCurrency: 'VND',
      supportedCurrencies: [
        {
          code: 'VND',
          decimals: 0,
          label: 'Việt Nam Đồng',
          symbol: '₫',
        },
      ],
    },
    products: {
      productsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        access: {
          read: () => true,
        },
        admin: {
          ...defaultCollection.admin,
          useAsTitle: 'title',
          defaultColumns: ['title', 'room', 'priceInVND'],
        },
        labels: {
          singular: 'Sản phẩm',
          plural: 'Sản phẩm',
        },
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            ...(defaultCollection.hooks?.beforeChange || []),
            async ({ data, req }) => {
              if (data.room) {
                try {
                  const room = await req.payload.findByID({
                    collection: 'rooms',
                    id: typeof data.room === 'object' ? data.room.id : data.room,
                  })
                  if (room && room.pricing?.hourly) {
                    data.priceInVND = room.pricing.hourly
                    data.priceInVNDEnabled = true
                  }
                } catch (e) {
                  // ignore error
                }
              }
              return data
            },
          ],
        },
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Tên sản phẩm',
          },
          {
            name: 'room',
            type: 'relationship',
            relationTo: 'rooms',
            label: 'Phòng liên kết',
            admin: {
              description: 'Chọn phòng để tự động điền giá',
            },
          },
          ...defaultCollection.fields.filter((field) => {
            const fieldsToRemove = ['stock', 'enableVariants', 'hasVariants', 'inventory']
            return !('name' in field && fieldsToRemove.includes(field.name))
          }),
          {
            name: 'roomPriceSync',
            type: 'ui',
            admin: {
              components: {
                Field: '@/components/RoomPriceSync',
              },
            },
          },
        ],
      }),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }: any) => ({
        ...defaultCollection,
        labels: {
          singular: 'Giỏ hàng',
          plural: 'Giỏ hàng',
        },
      }),
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }: any) => ({
        ...defaultCollection,
        labels: {
          singular: 'Đơn hàng',
          plural: 'Đơn hàng',
        },
        admin: {
          ...defaultCollection.admin,
          defaultColumns: [
            'createdAt',
            'customerName',
            'bookingRoom',
            'bookingDuration',
            'checkIn',
            'checkOut',
            'sepayPaymentStatus',
            'total',
          ],
          useAsTitle: 'customerName', // Use customer name as title if possible, or keep default
        },
        fields: [
          ...defaultCollection.fields.filter((field: any) => {
            // specific filter logic: remove 'customer' (Khách hàng), 'transactions' (Giao dịch)
            if (field.name === 'customer') return false
            if (field.name === 'orderedBy') return false // Keep just in case
            if (field.name === 'transactions') return false

            // Filter out customerEmail so we can use our own definition
            if (field.name === 'customerEmail') return false

            // Prevent duplication of other manually added fields if they ever get added to defaults
            if (['customerName', 'customerPhone', 'note', 'status'].includes(field.name))
              return false

            return true
          }),
          {
            name: 'customerName',
            type: 'text',
            label: 'Tên khách hàng',
            admin: {
              position: 'sidebar',
            },
          },
          {
            name: 'customerPhone',
            type: 'text',
            label: 'Số điện thoại',
            admin: {
              position: 'sidebar',
            },
          },
          {
            name: 'customerEmail',
            type: 'email',
            label: 'Email khách hàng',
            admin: {
              position: 'sidebar',
            },
          },
          {
            name: 'bookingRoom',
            type: 'text',
            label: 'Phòng',
            admin: {
              position: 'sidebar',
            },
          },
          {
            name: 'bookingDuration',
            type: 'text',
            label: 'Thời lượng',
            admin: {
              position: 'sidebar',
            },
          },
          {
            name: 'checkIn',
            type: 'date',
            label: 'Check-in',
            admin: {
              date: {
                pickerAppearance: 'dayAndTime',
              },
              position: 'sidebar',
            },
          },
          {
            name: 'checkOut',
            type: 'date',
            label: 'Check-out',
            admin: {
              date: {
                pickerAppearance: 'dayAndTime',
              },
              position: 'sidebar',
            },
          },
          {
            name: 'note',
            type: 'textarea',
            label: 'Ghi chú',
          },
          {
            name: 'sepayTransactionId',
            type: 'text',
            admin: {
              readOnly: true,
              position: 'sidebar',
            },
            label: 'Mã giao dịch SePay',
          },
          {
            name: 'sepayPaymentStatus',
            type: 'select',
            options: [
              { label: 'Chưa thanh toán', value: 'unpaid' },
              { label: 'Đã thanh toán', value: 'paid' },
              { label: 'Đã hủy', value: 'idled' },
            ],
            defaultValue: 'unpaid',
            admin: {
              position: 'sidebar',
            },
            label: 'Trạng thái thanh toán',
          },
        ],
      }),
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }: any) => ({
        ...defaultCollection,
        labels: {
          singular: 'Giao dịch',
          plural: 'Giao dịch',
        },
      }),
    },
  }),
]
