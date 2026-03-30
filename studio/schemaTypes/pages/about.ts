import {defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  type: 'document',
  fields: [
    defineField({name: 'description', type: 'portableText'}),
    defineField({name: 'selectedClients', type: 'portableText'}),
    defineField({
      name: 'contact',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'platform', title: 'Platform', type: 'string'},
            {name: 'link', title: 'url', type: 'string'},
          ],
        },
      ],
    }),
  ],

  preview: {
    prepare: () => ({title: 'Archive'}),
  },
})
