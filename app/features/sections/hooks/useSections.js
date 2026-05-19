// app/features/sections/hooks/useSections.js

import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import {
  createImageSection,
  createVideoSection,
  createImageColumnsSection,
  createBannerWithTextSection,
  createDividerSection,
  createRichTextSection,
  createAccordionSection,
  SECTION_TYPES,
} from '../types'

const cloneSectionWithNewIds = (value) => {
  if (Array.isArray(value)) {
    return value.map(cloneSectionWithNewIds)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        key === 'id' ? crypto.randomUUID() : cloneSectionWithNewIds(nestedValue),
      ])
    )
  }

  return value
}

export function useSections(initialSections = []) {
  const [sections, setSections] = useState(initialSections)

  const addSection = (type) => {
    const newSection =
      type === SECTION_TYPES.IMAGE
        ? createImageSection()
        : type === SECTION_TYPES.VIDEO
        ? createVideoSection()
        : type === SECTION_TYPES.BANNER_WITH_TEXT
        ? createBannerWithTextSection()
        : type === SECTION_TYPES.DIVIDER
        ? createDividerSection()
        : type === SECTION_TYPES.RICH_TEXT
        ? createRichTextSection()
        : type === SECTION_TYPES.ACCORDION
        ? createAccordionSection()
        : createImageColumnsSection()
    setSections((prev) => [...prev, newSection])
  }

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const duplicateSection = (id) => {
    setSections((prev) => {
      const sectionIndex = prev.findIndex((s) => s.id === id)
      if (sectionIndex === -1) return prev

      const duplicate = cloneSectionWithNewIds(prev[sectionIndex])
      return [
        ...prev.slice(0, sectionIndex + 1),
        duplicate,
        ...prev.slice(sectionIndex + 1),
      ]
    })
  }

  const updateSection = (id, changes) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    )
  }

  const reorderSections = (activeId, overId) => {
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === activeId)
      const newIndex = prev.findIndex((s) => s.id === overId)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return {
    sections,
    addSection,
    removeSection,
    duplicateSection,
    updateSection,
    reorderSections,
  }
}
