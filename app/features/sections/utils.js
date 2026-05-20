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

/**
 * Extract the subtitle/title from a section based on its type
 * Used to display additional context in the section list header
 * @param {Object} section - The section object
 * @returns {string} The subtitle, or empty string if none available
 */
export const getSectionSubtitle = (section) => {
  if (!section) return ''

  // Map of section types to their subtitle field names
  const subtitleFieldMap = {
    [SECTION_TYPES.IMAGE]: 'title',
    [SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES]: 'heading',
    [SECTION_TYPES.VIDEO]: 'title',
    [SECTION_TYPES.BANNER_WITH_TEXT]: 'heading',
    [SECTION_TYPES.RICH_TEXT]: 'title',
    [SECTION_TYPES.ACCORDION]: 'heading',
    [SECTION_TYPES.THICKNESS_CHART]: 'title',
    [SECTION_TYPES.VIDEO_GALLERY]: 'title',
    // Exclude divider and spacer
    [SECTION_TYPES.DIVIDER]: null,
    [SECTION_TYPES.SPACER]: null,
  }

  const fieldName = subtitleFieldMap[section.type]
  if (!fieldName) return ''

  const value = section[fieldName]

  if (typeof value !== 'string') return ''

  const trimmed = value.trim()

  return trimmed.length > 20
    ? `${trimmed.slice(0, 20)}...`
    : trimmed
}
