// types.js

export const SECTION_TYPES = {
  IMAGE: 'image_with_text',
  TEXT_COLUMNS_WITH_IMAGES: 'text_columns_with_images',
  VIDEO: 'video',
  BANNER_WITH_TEXT: 'banner_with_text',
  SPACER: 'spacer',
  DIVIDER: 'divider',
  RICH_TEXT: 'rich_text',
  ACCORDION: 'accordion',
  THICKNESS_CHART: 'thickness_chart',
  VIDEO_GALLERY: 'video_gallery',
}

export const IMAGE_LAYOUT = {
  LEFT: 'image_left',
  RIGHT: 'image_right',
  FULL_WIDTH: 'image_full_width',
}

// factories — always use these to create new sections
export const createImageSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.IMAGE,
  layout: IMAGE_LAYOUT.LEFT,
  imageUrl: '',
  title: '',
  description: '',
})

export const createVideoSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.VIDEO,
  videoUrl: '',
  title: '',
  description: '',
})

export const createImageColumnsSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES,
  columns: [
    { id: crypto.randomUUID(), imageUrl: '', title: '', description: '' },
  ],
})

export const createBannerWithTextSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.BANNER_WITH_TEXT,
  heading: '',
  imageUrl: '',
  alignment: 'center',
  imageWidth: 100,
  imageBorderRadius: 0,
})

export const createSpacerSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.SPACER,
  height: 40,
})

export const createDividerSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.DIVIDER,
  width: 1,
  paddingTop: 40,
  paddingBottom: 40,
})

export const createRichTextSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.RICH_TEXT,
  title: '',
  description: '',
  backgroundColor: '#ffffff',
  textAlignment: 'center',
  borderRadius: 8,
  paddingTop: 24,
  paddingRight: 24,
  paddingBottom: 24,
  paddingLeft: 24,
})

export const createAccordionSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.ACCORDION,
  heading: '',
  items: [
    {
      id: crypto.randomUUID(),
      heading: '',
      rows: [{ id: crypto.randomUUID(), name: '', value: '' }],
    },
  ],
})

export const createThicknessChartSection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.THICKNESS_CHART,
  title: '',
  subtitle: '',
  thicknesses: [{ id: crypto.randomUUID(), value: '' }],
  description: '',
})

export const createVideoGallerySection = () => ({
  id: crypto.randomUUID(),
  type: SECTION_TYPES.VIDEO_GALLERY,
  title: '',
  videos: [
    {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      author: '',
    },
  ],
})
