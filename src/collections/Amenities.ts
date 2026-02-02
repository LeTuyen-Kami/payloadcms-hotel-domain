import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  labels: {
    singular: 'Tiện ích',
    plural: 'Tiện ích phòng',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên tiện ích',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon (Lucide name - optional)',
    },
  ],
}
