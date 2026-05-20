// app/features/sections/sectionRegistry.js
// ── Add a new section type here — nowhere else needs to change ────────────────

import { ImageIcon, PlayCircleIcon, LayoutColumns2Icon, ImageWithTextOverlayIcon, MinusIcon, TextBlockIcon, ListBulletedIcon, LayoutRows2Icon, MeasurementSizeIcon, MediaReceiverIcon } from '@shopify/polaris-icons'
import { SECTION_TYPES } from './types'
import ImageSection from './components/ImageSection'
import VideoSection from './components/VideoSection'
import ImageColumnsSection from './components/ImageColumnsSection'
import BannerWithTextSection from './components/BannerWithTextSection'
import SpacerSection from './components/SpacerSection'
import DividerSection from './components/DividerSection'
import RichTextSection from './components/RichTextSection'
import AccordionSection from './components/AccordionSection'
import ThicknessChartSection from './components/ThicknessChartSection'
import VideoGallerySection from './components/VideoGallerySection'

const registry = {
  [SECTION_TYPES.IMAGE]: {
    label: 'Image with text',
    icon: ImageIcon,
    tone: 'success',
    component: ImageSection,
  },
  [SECTION_TYPES.VIDEO]: {
    label: 'Video',
    icon: PlayCircleIcon,
    tone: 'caution',
    component: VideoSection,
  },
  [SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES]: {
    label: 'Text columns with images',
    icon: LayoutColumns2Icon,
    tone: 'success',
    component: ImageColumnsSection,
  },
  [SECTION_TYPES.BANNER_WITH_TEXT]: {
    label: 'Banner',
    icon: ImageWithTextOverlayIcon,
    tone: 'success',
    component: BannerWithTextSection,
  },
  [SECTION_TYPES.SPACER]: {
    label: 'Spacer',
    icon: LayoutRows2Icon,
    tone: 'subdued',
    component: SpacerSection,
  },
  [SECTION_TYPES.DIVIDER]: {
    label: 'Divider',
    icon: MinusIcon,
    tone: 'subdued',
    component: DividerSection,
  },
  [SECTION_TYPES.RICH_TEXT]: {
    label: 'Rich text',
    icon: TextBlockIcon,
    tone: 'success',
    component: RichTextSection,
  },
  [SECTION_TYPES.ACCORDION]: {
    label: 'Accordion',
    icon: ListBulletedIcon,
    tone: 'success',
    component: AccordionSection,
  },
  [SECTION_TYPES.THICKNESS_CHART]: {
    label: 'Thickness chart',
    icon: MeasurementSizeIcon,
    tone: 'success',
    component: ThicknessChartSection,
  },
  [SECTION_TYPES.VIDEO_GALLERY]: {
    label: 'Video gallery',
    icon: MediaReceiverIcon,
    tone: 'success',
    component: VideoGallerySection,
  }
}

export const getSectionMeta = (type) =>
  registry[type] ?? {
    label: 'Unknown section',
    icon: ImageIcon,
    tone: 'subdued',
    component: () => null,
  }
