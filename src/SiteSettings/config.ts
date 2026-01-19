import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'general',
      type: 'group',
      label: 'General Settings',
      fields: [
        {
          name: 'siteTitle',
          type: 'text',
          label: 'Site Title',
          defaultValue: 'Cloud9 Hotel',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Site Logo',
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
      label: 'Contact Information',
      fields: [
        {
          name: 'hotline',
          type: 'text',
          label: 'Main Hotline',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Contact Email',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Headquarters Address',
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Social Media',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook URL',
        },
        {
          name: 'zalo',
          type: 'text',
          label: 'Zalo URL',
        },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      label: 'Footer Content',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          label: 'Footer Description',
        },
        {
          name: 'copyright',
          type: 'text',
          label: 'Copyright Text',
        },
      ],
    },
  ],
}
