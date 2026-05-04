import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',

  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      type: 'string',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      options: {
        sortable: true,
      },
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'year',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'portableText',
    }),
    defineField({
      name: 'coverMedia',
      title: 'Cover Media',
      type: 'mediaAsset', // ⚠️ needs to be defined!
    }),
    defineField({
      name: 'gallery',
      type: 'gallery',
      description:
        'Queste immagini verranno mostrate a tutta altezza dello schermo sotto i commenti.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'role', title: 'Role', type: 'string'}),
            defineField({
              name: 'entries',
              title: 'Entries',
              type: 'array',
              of: [{type: 'string', name: 'entry'}],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'url',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title,
      }
    },
  },
})
