import {project} from './project'
import {category} from './category'
import {site} from './site'
import {gallery} from './types/gallery'
import {imageAsset} from './types/imageAsset'
import {link} from './types/link'
import {portableText} from './types/portableText'
import {videoAsset} from './types/videoAsset'
import {page} from './types/page'
import {mediaAsset} from './types/mediaAsset'
import {archive} from './pages/archive'
import {about} from './pages/about'

export const schemaTypes = [
  site,
  category,
  project,
  portableText,
  gallery,
  imageAsset,
  videoAsset,
  mediaAsset,
  link,
  page,
  archive,
  about,
]
