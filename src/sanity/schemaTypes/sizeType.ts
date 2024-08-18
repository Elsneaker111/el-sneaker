import {defineField, defineType} from 'sanity'

export const sizeType = defineType({
  name: 'size',
  title: 'Size',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      title: 'Size',
      type: 'number',
    }),
    defineField({
      name: 'out_of_stock',
      title: 'Out of Stock',
      type: 'boolean',
    }),
  ],
})
