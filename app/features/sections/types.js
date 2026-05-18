// types.js

export const SECTION_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  IMAGE_COLUMNS: 'image_columns',
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
  imageAlt: '',
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
  type: SECTION_TYPES.IMAGE_COLUMNS,
  columns: [
    { id: crypto.randomUUID(), imageUrl: '', imageAlt: '', title: '', description: '' },
  ],
})