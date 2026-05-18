// app/features/sections/utils.js

export const serializeSections = (sections) => {
  return JSON.stringify({ sections })
}

export const deserializeSections = (metafieldValue) => {
  if (!metafieldValue) return []
  try {
    const parsed = JSON.parse(metafieldValue)
    return parsed.sections || []
  } catch {
    return []
  }
}