// app/features/sections/schema.js
/**
 * Centralized schema system for sections
 * Defines field requirements, types, and validation for all section types
 * 
 * METAFIELD FORMAT:
 * {
 *   "sections": [
 *     {
 *       "id": "uuid",
 *       "type": "image_with_text" | "text_columns_with_images" | "video",
 *       ... section-specific fields
 *     }
 *   ]
 * }
 */

import { SECTION_TYPES } from './types'

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (typeof value === 'string' && value.trim() === '')

/**
 * Schema definitions for each section type
 * Each field specifies: type, required, description
 */
export const SECTION_SCHEMAS = {
  [SECTION_TYPES.IMAGE]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      layout: { type: 'string', required: false, description: 'Image alignment (left/right)' },
      imageUrl: { type: 'string', required: true, description: 'Image URL' },
      title: { type: 'string', required: true, description: 'Section title' },
      description: { type: 'string', required: false, description: 'Section description' },
    },
  },

  [SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      heading: { type: 'string', required: true, description: 'Section heading' },
      columns: { type: 'array', required: true, description: 'Array of image columns' },
    },
    columnFields: {
      id: { type: 'string', required: true, description: 'Column unique identifier' },
      imageUrl: { type: 'string', required: true, description: 'Image URL' },
      title: { type: 'string', required: true, description: 'Column title' },
      description: { type: 'string', required: false, description: 'Column description' },
    },
  },

  [SECTION_TYPES.VIDEO]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      videoUrl: { type: 'string', required: true, description: 'YouTube/Vimeo video URL' },
      title: { type: 'string', required: true, description: 'Section title' },
      description: { type: 'string', required: false, description: 'Section description' },
    },
  },

  [SECTION_TYPES.BANNER_WITH_TEXT]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      imageUrl: { type: 'string', required: true, description: 'Banner background image URL' },
      heading: { type: 'string', required: false, description: 'Banner heading' },
      alignment: { type: 'string', required: false, description: 'Text alignment (left/center/right)' },
      imageWidth: { type: 'number', required: false, description: 'Image width in percentage' },
      imageBorderRadius: { type: 'number', required: false, description: 'Banner border radius in pixels' },
    },
  },

  [SECTION_TYPES.DIVIDER]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      width: { type: 'number', required: false, description: 'Divider line width in pixels' },
      paddingTop: { type: 'number', required: false, description: 'Top padding in pixels' },
      paddingBottom: { type: 'number', required: false, description: 'Bottom padding in pixels' },
    },
  },

  [SECTION_TYPES.SPACER]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      height: { type: 'number', required: false, description: 'Spacer height in pixels' },
    },
  },

  [SECTION_TYPES.RICH_TEXT]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      title: { type: 'string', required: true, description: 'Rich text title' },
      description: { type: 'string', required: false, description: 'Rich text body content' },
      backgroundColor: { type: 'string', required: false, description: 'Section background color' },
      textAlignment: { type: 'string', required: false, description: 'Text alignment (left/center/right)' },
      borderRadius: { type: 'number', required: false, description: 'Section border radius in pixels' },
      paddingTop: { type: 'number', required: false, description: 'Top padding in pixels' },
      paddingRight: { type: 'number', required: false, description: 'Right padding in pixels' },
      paddingBottom: { type: 'number', required: false, description: 'Bottom padding in pixels' },
      paddingLeft: { type: 'number', required: false, description: 'Left padding in pixels' },
    },
  },

  [SECTION_TYPES.ACCORDION]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      heading: { type: 'string', required: true, description: 'Section heading' },
      items: { type: 'array', required: true, description: 'Array of accordion items' },
    },
    itemFields: {
      id: { type: 'string', required: true, description: 'Accordion item unique identifier' },
      heading: { type: 'string', required: true, description: 'Item heading' },
      rows: { type: 'array', required: true, description: 'Rows' },
    },
    rowFields: {
      id: { type: 'string', required: true, description: 'Row unique identifier' },
      name: { type: 'string', required: true, description: 'Name' },
      value: { type: 'string', required: true, description: 'Value' },
    },
  },

  [SECTION_TYPES.THICKNESS_CHART]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      title: { type: 'string', required: true, description: 'Chart title' },
      subtitle: { type: 'string', required: false, description: 'Chart subtitle' },
      thicknesses: { type: 'array', required: true, description: 'Thickness values' },
      description: { type: 'string', required: false, description: 'Chart rich text description' },
    },
    thicknessFields: {
      id: { type: 'string', required: true, description: 'Thickness unique identifier' },
      value: { type: 'string', required: true, description: 'Thickness value' },
    },
  },

  [SECTION_TYPES.VIDEO_GALLERY]: {
    fields: {
      id: { type: 'string', required: true, description: 'Unique identifier' },
      type: { type: 'string', required: true, description: 'Section type' },
      title: { type: 'string', required: true, description: 'Gallery title' },
      videos: { type: 'array', required: false, description: 'Playlist videos' },
    },
    videoFields: {
      id: { type: 'string', required: true, description: 'Video unique identifier' },
      title: { type: 'string', required: true, description: 'Video title' },
      url: { type: 'string', required: true, description: 'Video URL' },
      author: { type: 'string', required: false, description: 'Video author' },
    },
  },
}

/**
 * Get required fields for a section type
 * @param {string} sectionType - The section type
 * @returns {string[]} Array of required field names
 */
export const getRequiredFields = (sectionType) => {
  const schema = SECTION_SCHEMAS[sectionType]
  if (!schema) return []
  return Object.entries(schema.fields)
    .filter(([, field]) => field.required)
    .map(([name]) => name)
}

/**
 * Get required column fields for ImageColumns sections
 * @returns {string[]} Array of required column field names
 */
export const getRequiredColumnFields = () => {
  const schema = SECTION_SCHEMAS[SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES]
  if (!schema?.columnFields) return []
  return Object.entries(schema.columnFields)
    .filter(([, field]) => field.required)
    .map(([name]) => name)
}

export const getRequiredAccordionItemFields = () => {
  const schema = SECTION_SCHEMAS[SECTION_TYPES.ACCORDION]
  if (!schema?.itemFields) return []
  return Object.entries(schema.itemFields)
    .filter(([, field]) => field.required)
    .map(([name]) => name)
}

export const getRequiredAccordionRowFields = () => {
  const schema = SECTION_SCHEMAS[SECTION_TYPES.ACCORDION]
  if (!schema?.rowFields) return []
  return Object.entries(schema.rowFields)
    .filter(([, field]) => field.required)
    .map(([name]) => name)
}

/**
 * Validate a section against its schema
 * @param {object} section - The section object to validate
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateSection = (section) => {
  const errors = []
  const schema = SECTION_SCHEMAS[section.type]

  if (!schema) {
    errors.push(`Unknown section type: ${section.type}`)
    return { isValid: false, errors }
  }

  // Check required fields
  Object.entries(schema.fields).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.required) {
      const value = section[fieldName]
      if (isBlank(value)) {
        errors.push(`${fieldName} is required`)
      }
    }
  })

  // For image columns, validate each column
  if (section.type === SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES && section.columns) {
    section.columns.forEach((column, index) => {
      const columnErrors = validateColumn(column)
      if (columnErrors.length > 0) {
        errors.push(`Column ${index + 1}: ${columnErrors.join(', ')}`)
      }
    })
  }

  if (section.type === SECTION_TYPES.ACCORDION && section.items) {
    if (section.items.length === 0) {
      errors.push('At least one accordion item is required')
    }

    section.items.forEach((item, index) => {
      const itemErrors = validateAccordionItem(item)
      if (itemErrors.length > 0) {
        errors.push(`Accordion ${index + 1}: ${itemErrors.join(', ')}`)
      }
    })
  }

  if (section.type === SECTION_TYPES.THICKNESS_CHART) {
    if (!section.thicknesses || section.thicknesses.length === 0) {
      errors.push('At least one thickness is required')
    }

    section.thicknesses?.forEach((thickness, index) => {
      if (isBlank(thickness.value)) {
        errors.push(`Thickness ${index + 1}: value is required`)
      }
    })
  }

  if (section.type === SECTION_TYPES.VIDEO_GALLERY) {
    section.videos?.forEach((video, index) => {
      const videoErrors = validateGalleryVideo(video)
      if (videoErrors.length > 0) {
        errors.push(`Playlist video ${index + 1}: ${videoErrors.join(', ')}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a column in ImageColumns section
 * @param {object} column - The column object to validate
 * @returns {string[]} Array of error messages
 */
export const validateColumn = (column) => {
  const errors = []
  const schema = SECTION_SCHEMAS[SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES].columnFields

  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.required) {
      const value = column[fieldName]
      if (isBlank(value)) {
        errors.push(`${fieldName} is required`)
      }
    }
  })

  return errors
}

export const validateAccordionRow = (row) => {
  const errors = []
  const schema = SECTION_SCHEMAS[SECTION_TYPES.ACCORDION].rowFields

  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.required && isBlank(row[fieldName])) {
      errors.push(`${fieldName} is required`)
    }
  })

  return errors
}

export const validateAccordionItem = (item) => {
  const errors = []
  const schema = SECTION_SCHEMAS[SECTION_TYPES.ACCORDION].itemFields

  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.required && isBlank(item[fieldName])) {
      errors.push(`${fieldName} is required`)
    }
  })

  if (!item.rows || item.rows.length === 0) {
    errors.push('At least one row is required')
  }

  if (item.rows) {
    item.rows.forEach((row, index) => {
      const rowErrors = validateAccordionRow(row)
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`)
      }
    })
  }

  return errors
}

export const validateGalleryVideo = (video) => {
  const errors = []
  const schema = SECTION_SCHEMAS[SECTION_TYPES.VIDEO_GALLERY].videoFields

  if (!video) return ['video is required']

  Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.required && isBlank(video[fieldName])) {
      errors.push(`${fieldName} is required`)
    }
  })

  return errors
}

/**
 * Get schema for a section type (for reference/documentation)
 * @param {string} sectionType - The section type
 * @returns {object} The schema definition
 */
export const getSchemaForType = (sectionType) => {
  return SECTION_SCHEMAS[sectionType]
}

/**
 * Print metafield format documentation
 * Use this to understand the structure being stored
 */
export const printMetafieldFormat = () => {
  console.log(`
=== METAFIELD FORMAT ===

The sections are stored in Shopify metafield as JSON:

{
  "sections": [
    {
      "id": "uuid-string",
      "type": "image_with_text" | "text_columns_with_images" | "video",
      
      // IMAGE_WITH_TEXT fields:
      "layout": "image_left" | "image_right",
      "imageUrl": "https://...",
      "title": "Section title",
      "description": "Optional description",
      
      // TEXT_COLUMNS_WITH_IMAGES fields:
      "heading": "Section heading",
      "columns": [
        {
          "id": "uuid-string",
          "imageUrl": "https://...",
          "title": "Column title",
          "description": "Optional description"
        }
      ],
      
      // VIDEO fields:
      "videoUrl": "https://youtube.com/watch?v=...",
      "title": "Section title",
      "description": "Optional description"
    }
  ]
}

REQUIRED FIELDS BY TYPE:
${Object.entries(SECTION_SCHEMAS)
  .map(
    ([type, schema]) => `
  ${type}:
${Object.entries(schema.fields)
  .filter(([, field]) => field.required)
  .map(([name]) => `    - ${name}`)
  .join('\n')}`,
  )
  .join('\n')}
  `)
}
