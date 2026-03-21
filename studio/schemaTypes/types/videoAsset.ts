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
    }),
    defineField({
      title: 'Alt Text',
      name: 'altText',
      type: 'string',
      description: 'Importante per SEO e accessibilità',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'string',
      description: 'Inserisci qui il testo del copyright',
    }),
  ],
  preview: {
    select: {
      file: 'file',
      altText: 'altText',
      copyright: 'copyright',
      uploadedAt: 'file.asset._createdAt',
    },
    prepare({file, altText, copyright, uploadedAt}) {
      const title = altText?.trim() || 'Video'
      const subtitle = copyright?.trim() || `Caricato ${formatDate(uploadedAt)}`

      return {
        title,
        media: file,
        subtitle,
      }
    },
  },
})
