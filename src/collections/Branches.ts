import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Branches: CollectionConfig = {
  slug: 'branches',
  labels: {
    singular: 'Chi nhánh',
    plural: 'Quản lý Chi nhánh',
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tên chi nhánh',
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
      label: 'Địa chỉ',
    },
    {
      name: 'mapLink',
      type: 'text',
      label: 'Link Google Maps',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Số điện thoại',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email liên hệ',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Ảnh đại diện chi nhánh',
    },
    slugField(),
  ],
}
