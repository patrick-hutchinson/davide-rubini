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
    // defineField({
    //   name: 'credits',
    //   type: 'array',
    //   of: [
    //     {
    //       type: 'object',
    //       fields: [
    //         defineField({name: 'role', title: 'Role', type: 'string'}),
    //         defineField({
    //           name: 'people',
    //           title: 'People',
    //           type: 'array',
    //           of: [{type: 'string'}],
    //           options: {
    //             layout: 'tags',
    //           },
    //           description:
    //             "⚠️ Aggiungi i nomi dei festival e poi premi INVIO, così l'inserimento comparirà come tag.",
    //         }),
    //       ],
    //     },
    //   ],
    // }),
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
