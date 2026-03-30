import {defineField, defineType} from 'sanity'

export const archive = defineType({
  name: 'archive',
  title: 'Archive',

  type: 'document',
  fields: [
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'gallery',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Archive'}),
  },
})
