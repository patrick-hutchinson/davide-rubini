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
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context?.parent as {vimeoUrl?: string} | undefined
          const hasVimeoUrl = Boolean(parent?.vimeoUrl?.trim())
          if (hasVimeoUrl) return true
          return value ? true : 'No file attached!'
        }),
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo URL',
      type: 'url',
      description: 'Optional Vimeo link. If provided, this can be used instead of a Mux file.',
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https']}).custom((value, context) => {
          const parent = context?.parent as {file?: unknown} | undefined
          const hasFile = Boolean(parent?.file)
          if (hasFile) return true
          return value ? true : 'No file attached!'
        }),
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
      vimeoUrl: 'vimeoUrl',
      altText: 'altText',
      uploadedAt: 'file.asset._createdAt',
    },
    prepare({file, vimeoUrl, altText, uploadedAt}) {
      const title = altText?.trim() || 'Video'
      const hasFile = Boolean(file?.asset?._ref || file?.assetId || file?._ref)
      const hasVimeo = Boolean(vimeoUrl?.trim())
      const subtitle = hasFile ? `Caricato ${formatDate(uploadedAt)}` : hasVimeo ? 'Vimeo linked' : 'No file attached!'

      return {
        title,
        media: file,
        subtitle,
      }
    },
  },
})
