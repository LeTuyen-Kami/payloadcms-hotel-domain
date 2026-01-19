import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Room Name (e.g., Standard, Deluxe)',
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: true,
      hasMany: false,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Room Images',
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
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'firstTwoHours',
          type: 'number',
          label: 'Price for First 2 Hours',
        },
        {
          name: 'additionalHour',
          type: 'number',
          label: 'Price for Each Additional Hour',
        },
        {
          name: 'overnight',
          type: 'number',
          label: 'Overnight Price',
        },
        {
          name: 'daily',
          type: 'number',
          label: 'Daily Price',
        },
      ],
    },
    slugField(),
  ],
}
