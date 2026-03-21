import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

import {structure} from './structure'

import {muxInput} from 'sanity-plugin-mux-input'

export default defineConfig({
  name: 'default',
  title: 'davide-rubini',

  projectId: 'kcuxsqwd',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool(), muxInput()],

  schema: {
    types: schemaTypes,
  },
})
