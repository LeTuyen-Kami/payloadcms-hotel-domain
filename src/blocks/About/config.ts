import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { link } from '@/fields/link'

export const About: Block = {
  slug: 'about',
  interfaceName: 'AboutBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề',
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Mô tả',
    },
    {
      name: 'images',
      type: 'group',
      label: 'Bộ sưu tập hình ảnh (Collage)',
      fields: [
        {
          name: 'verticalImage',
          type: 'relationship',
          relationTo: 'media',
          required: true,
          label: 'Ảnh dọc (bên trái)',
        },
        {
          name: 'horizontalImage1',
          type: 'relationship',
          relationTo: 'media',
          required: true,
          label: 'Ảnh ngang 1 (trên cùng bên phải)',
        },
        {
          name: 'horizontalImage2',
          type: 'relationship',
          relationTo: 'media',
          required: true,
          label: 'Ảnh ngang 2 (dưới cùng bên phải)',
        },
      ],
    },
    {
      name: 'enableLink',
      type: 'checkbox',
      label: 'Hiển thị nút CTA',
    },
    link({
      overrides: {
        admin: {
          condition: (_data, siblingData) => {
            return Boolean(siblingData?.enableLink)
          },
        },
      },
    }),
  ],
  labels: {
    plural: 'About Blocks',
    singular: 'About Block',
  },
}
