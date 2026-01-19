import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  access: {
    create: () => true, // Allow anyone to create bookings
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'branch', 'checkIn', 'status'],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Overnight', value: 'overnight' },
        { label: 'Daily', value: 'daily' },
      ],
      required: true,
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: true,
      hasMany: false,
    },
    {
      name: 'roomType', // Not strictly linking to Rooms collection to avoid complexity if room not selected yet
      type: 'text',
      label: 'Requested Room Type',
    },
    {
      name: 'checkIn',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'checkOut',
      type: 'date',
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
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
}
