// app/features/sections/utils.js

import { SECTION_TYPES } from './types'

const normalizeSectionForStorage = (section) => {
  if (section?.type !== SECTION_TYPES.VIDEO_GALLERY) return section

  const videoGallerySection = { ...section }
  delete videoGallerySection.featuredVideo
  return videoGallerySection
}

const normalizeSectionsForStorage = (sections = []) =>
  sections.map(normalizeSectionForStorage)

export const serializeSections = (sections) => {
  return JSON.stringify({ sections: normalizeSectionsForStorage(sections) })
}

export const deserializeSections = (metafieldValue) => {
  if (!metafieldValue) return []
  try {
    const parsed = JSON.parse(metafieldValue)
    return normalizeSectionsForStorage(parsed.sections || [])
  } catch {
    return []
  }
}
