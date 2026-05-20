// app/features/sections/hooks/useProductMetafield.js

import { useFetcher } from 'react-router'
import { serializeSections } from '../utils'

export function useProductMetafield() {
  const fetcher = useFetcher()

  const isSaving = fetcher.state === 'submitting'
  const isSuccess =
    fetcher.state === 'idle' && fetcher.data?.success === true

  const saveSectionsError =
    fetcher.state === 'idle' &&
    fetcher.data?.success === false &&
    typeof fetcher.data?.error === 'string'
      ? fetcher.data.error
      : null

  const saveSections = (sections) => {
    const formData = new FormData()
    formData.append('sections', serializeSections(sections))
    fetcher.submit(formData, { method: 'POST' })
  }

  return {
    saveSections,
    isSaving,
    isSuccess,
    saveSectionsError,
  }
}