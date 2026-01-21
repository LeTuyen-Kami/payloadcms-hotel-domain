import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cài đặt chung',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'general',
      type: 'group',
      label: 'Cấu hình chung',
      fields: [
        {
          name: 'siteTitle',
          type: 'text',
          label: 'Tiêu đề website',
          defaultValue: 'Cloud9 Hotel',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Thông tin liên hệ',
      fields: [
        {
          name: 'hotline',
          type: 'text',
          label: 'Hotline chính',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email liên hệ',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Địa chỉ trụ sở',
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Mạng xã hội',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Link Facebook',
        },
        {
          name: 'zalo',
          type: 'text',
          label: 'Link Zalo',
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Nội dung chân trang',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Mô tả chân trang',
        },
        {
          name: 'copyright',
          type: 'text',
          label: 'Bản quyền',
        },
      ],
    },
    {
      name: 'googleMaps',
      type: 'group',
      label: 'Tích hợp Google Maps',
      fields: [
        {
          name: 'placeId',
          type: 'text',
          label: 'Google Place ID',
          required: false,
          admin: {
            description: 'Find your Place ID using Google Place ID Finder',
          },
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'Google Maps API Key',
          required: false,
          admin: {
            description: 'Must have Places API enabled',
          },
        },
        {
          name: 'syncButton',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/SyncGoogleReviews',
            },
          },
        },
      ],
    },
  ],
}
