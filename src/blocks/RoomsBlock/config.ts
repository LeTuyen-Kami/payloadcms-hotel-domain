import type { Block } from 'payload'

export const RoomsBlock: Block = {
  slug: 'roomsBlock',
  labels: {
    singular: 'Rooms Block',
    plural: 'Rooms Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Our Rooms',
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      label: 'Filter by Branch',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
    },
  ],
}
