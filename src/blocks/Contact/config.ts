import type { Block } from 'payload'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const ContactBlock: Block = {
  slug: 'contactBlock',
  interfaceName: 'ContactBlock',
  labels: {
    singular: 'Contact Block',
    plural: 'Contact Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
          ]
        },
      }),
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: 'Form to Display',
    },
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'showContactInfo',
          type: 'checkbox',
          label: 'Show Contact Info Overlay/Sidebar',
          defaultValue: true,
        },
        {
          name: 'overrideContactInfo',
          type: 'checkbox',
          label: 'Override Global Site Settings',
          defaultValue: false,
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          admin: {
            condition: (_, { overrideContactInfo }) => Boolean(overrideContactInfo),
          },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          admin: {
            condition: (_, { overrideContactInfo }) => Boolean(overrideContactInfo),
          },
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Physical Address',
          admin: {
            condition: (_, { overrideContactInfo }) => Boolean(overrideContactInfo),
          },
        },
      ],
    },
  ],
}
