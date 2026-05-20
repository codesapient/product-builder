import { useCallback, useMemo, useState } from 'react'

import {
  Banner,
  BlockStack,
  Button,
  Card,
  InlineStack,
} from '@shopify/polaris'

import BadgeSettings from './components/BadgeSettings'
import SpecificationsSettings from './components/SpecificationsSettings'
import OtherSettings from './components/OtherSettings'

import { useProductGeneralSettingsMetafield } from '../../features/sections/hooks/useProductGeneralSettingsMetafield'

function parseFullSettings(product) {
  const raw = product?.generalSettingsMetafield?.value

  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function buildInitialBadge(product) {
  const full = parseFullSettings(product)

  const badge = full?.badge

  if (badge && typeof badge === 'object') {
    return {
      badge_text: badge.badge_text || '',
      badge_category: badge.badge_category || '',
      badge_url: badge.badge_url || '',
    }
  }

  return {
    badge_text: '',
    badge_category: '',
    badge_url: '',
  }
}

function buildInitialSpecifications(product) {
  const full = parseFullSettings(product)

  const specs = full?.specifications

  if (Array.isArray(specs) && specs.length > 0) {
    return specs
  }

  if (specs && typeof specs === 'object') {
    return Object.entries(specs).map(([name, value]) => ({
      name,
      value: Array.isArray(value)
        ? value.join(', ')
        : String(value ?? ''),
    }))
  }

  return [{ name: '', value: '' }]
}

function buildInitialOtherSettings(product) {
  const full = parseFullSettings(product)

  const other =
    full?.other_settings ?? {}

  return {
    customize_url_button:
      other.customize_url_button || '',

    social_proof:
      other.social_proof || '',
  }
}

export default function ProductSettings({
  product,
  storeUrl,
}) {

  const fullSettings = useMemo(
    () => parseFullSettings(product),
    [product]
  )

  const [badge, setBadge] = useState(
    buildInitialBadge(product)
  )

  const [specifications, setSpecifications] = useState(
    buildInitialSpecifications(product)
  )

  const [otherSettings, setOtherSettings] = useState(
    buildInitialOtherSettings(product)
  )

  const [showSuccess, setShowSuccess] =
    useState(false)

  const {
    saveGeneralSettings,
    isSaving,
  } = useProductGeneralSettingsMetafield()

  const handleSaveAll = useCallback(async () => {
    setShowSuccess(false)

    const settings = {
      ...fullSettings,

      badge,

      specifications,

      other_settings: otherSettings,
    }

    delete settings.badges

    await saveGeneralSettings(settings)

    setShowSuccess(true)

  }, [
    badge,
    specifications,
    otherSettings,
    fullSettings,
    saveGeneralSettings,
  ])

  return (
    <BlockStack gap="400">

      <Card>

        <BlockStack gap="400">

          <InlineStack align="end">

            <Button
              variant="primary"
              loading={isSaving}
              onClick={handleSaveAll}
            >
              Save settings
            </Button>

          </InlineStack>

          {showSuccess && (
            <Banner
              tone="success"
              title="Settings saved successfully!"
            />
          )}

          {/* Badge */}

          <BadgeSettings
            product={product}
            storeUrl={storeUrl}
            value={badge}
            onChange={setBadge}
          />

          {/* Specifications */}

          <SpecificationsSettings
            product={product}
            value={specifications}
            onChange={setSpecifications}
          />

          {/* Other Settings */}

          <OtherSettings
            storeUrl={storeUrl}
            value={otherSettings}
            onChange={setOtherSettings}
          />

        </BlockStack>

      </Card>

    </BlockStack>
  )
}