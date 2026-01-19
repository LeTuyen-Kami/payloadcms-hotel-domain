import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonialsBlock',
  labels: {
    singular: 'Testimonials Block',
    plural: 'Testimonials Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Khách hàng nói gì về chúng tôi',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
    },
  ],
}
