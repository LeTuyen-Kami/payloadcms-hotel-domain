import type { Block } from 'payload'

export const GoogleReviewsBlock: Block = {
  slug: 'googleReviewsBlock',
  labels: {
    singular: 'Đánh giá từ bên ngoài (Custom Embed)',
    plural: 'Đánh giá từ bên ngoài (Custom Embed)',
  },
  fields: [
    {
      name: 'embedCode',
      type: 'textarea',
      label: 'Mã nhúng (Embed Code)',
      admin: {
        description: 'Dán toàn bộ mã nhúng (script và div) từ Elfsight, Trustindex, v.v. vào đây.',
      },
      required: true,
    },
  ],
}
