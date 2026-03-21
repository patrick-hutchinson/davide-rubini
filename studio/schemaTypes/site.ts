import {defineField, defineType} from 'sanity'

export const site = defineType({
  name: 'site',
  title: 'Site',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Website Name',
      description: 'As seen on Google Search Results and Tab Bar',
      type: 'string',
    }),
    defineField({
      name: 'owner',
      title: 'Website Owner',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Website Description',
      type: 'string',
      description: 'As seen on Google Search Results (max. 160 characters)',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'address',
      type: 'object',
      options: {
        columns: 3,
      },
      fields: [
        {
          name: 'street',
          title: 'Street',
          type: 'string',
          options: {columns: 3}, // full width
        },
        {
          name: 'postcode',
          title: 'Post code',
          type: 'string',
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
        },
        {
          name: 'country',
          title: 'Country',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      type: 'string',
    }),
    defineField({
      name: 'socials',
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
    prepare: () => ({title: 'Site'}),
  },
})
