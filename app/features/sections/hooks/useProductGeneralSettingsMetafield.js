// app/features/sections/hooks/useProductGeneralSettingsMetafield.js

import { useFetcher } from 'react-router'

export function useProductGeneralSettingsMetafield() {
  const fetcher = useFetcher()

  const isSaving = fetcher.state === 'submitting'
  const isSuccess = fetcher.state === 'idle' && fetcher.data?.success === true

  const saveGeneralSettings = (generalSettings) => {
    const formData = new FormData()
    formData.append('generalSettings', JSON.stringify(generalSettings))
    fetcher.submit(formData, { method: 'POST' })
  }

  return {
    saveGeneralSettings,
    isSaving,
    isSuccess,
  }
}