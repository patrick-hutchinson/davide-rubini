import {defineType, defineField} from 'sanity'

const formatDate = (value?: string) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString()
  return date.toLocaleDateString()
}

export const videoAsset = defineType({
  name: 'videoAsset',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      title: 'File',
      type: 'mux.video',
      options: {
        collapsible: false,
        collapsed: false,
      },
      validation: (Rule) => Rule.required().error('No file attached!'),
    }),
    defineField({
      title: 'Alt Text',
      name: 'altText',
      type: 'string',
      description: 'Importante per SEO e accessibilità',
    }),
  ],
  preview: {
    select: {
      file: 'file',
      altText: 'altText',
      uploadedAt: 'file.asset._createdAt',
    },
    prepare({file, altText, uploadedAt}) {
      const title = altText?.trim() || 'Video'
      const hasFile = Boolean(file?.asset?._ref || file?.assetId || file?._ref)
      const subtitle = hasFile ? `Caricato ${formatDate(uploadedAt)}` : 'No file attached!'

      return {
        title,
        media: file,
        subtitle,
      }
    },
  },
})
