// app/features/sections/hooks/useSections.js

import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import {
  createImageSection,
  createVideoSection,
  createImageColumnsSection,
  SECTION_TYPES,
} from '../types'

export function useSections(initialSections = []) {
  const [sections, setSections] = useState(initialSections)

  const addSection = (type) => {
    const newSection =
      type === SECTION_TYPES.IMAGE
        ? createImageSection()
        : type === SECTION_TYPES.VIDEO
        ? createVideoSection()
        : createImageColumnsSection()
    setSections((prev) => [...prev, newSection])
  }

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
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
    updateSection,
    reorderSections,
  }
}