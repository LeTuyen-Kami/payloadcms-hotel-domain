import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Đánh giá',
    plural: 'Đánh giá khách hàng',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tên khách hàng',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Nội dung đánh giá',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 5,
      label: 'Đánh giá (Sao)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Ảnh đại diện (Sẽ ưu tiên dùng nếu có)',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Nguồn đánh giá',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Website', value: 'website' },
      ],
      defaultValue: 'google',
    },
  ],
}
