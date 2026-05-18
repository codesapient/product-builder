// app/features/sections/sectionRegistry.js
// ── Add a new section type here — nowhere else needs to change ────────────────

import { ImageIcon, PlayCircleIcon, LayoutColumns2Icon } from '@shopify/polaris-icons'
import { SECTION_TYPES } from './types'
import ImageSection from './components/ImageSection'
import VideoSection from './components/VideoSection'
import ImageColumnsSection from './components/ImageColumnsSection'

const registry = {
  [SECTION_TYPES.IMAGE]: {
    label: 'Image section',
    icon: ImageIcon,
    tone: 'success',
    component: ImageSection,
  },
  [SECTION_TYPES.VIDEO]: {
    label: 'Video section',
    icon: PlayCircleIcon,
    tone: 'caution',
    component: VideoSection,
  },
  [SECTION_TYPES.IMAGE_COLUMNS]: {
    label: 'Image columns',
    icon: LayoutColumns2Icon,
    tone: 'success',
    component: ImageColumnsSection,
  },
}

export const getSectionMeta = (type) =>
  registry[type] ?? {
    label: 'Unknown section',
    icon: ImageIcon,
    tone: 'subdued',
    component: () => null,
  }