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
      text: badge.text || '',
      category: badge.category || '',
      category_url: badge.category_url || '',
    }
  }

  return {
    text: '',
    category: '',
    category_url: '',
  }
}

// specification settings
function createSpecificationRow(
  row = {}
) {
  return {
    id:
      row.id ||
      crypto.randomUUID(),
    name: row.name || '',
    value: row.value || '',
  }
}

function buildInitialSpecifications(product) {
  const full = parseFullSettings(product)

  const specs = full?.specifications

  if (Array.isArray(specs) && specs.length > 0) {
    return specs.map((row) =>
      createSpecificationRow(row)
    )
  }

  if (specs && typeof specs === 'object') {
    return Object.entries(specs).map(
      ([name, value]) =>
        createSpecificationRow({
          name,
          value: Array.isArray(value)
            ? value.join(', ')
            : String(value ?? ''),
        })
    )
  }

  return [createSpecificationRow()]
}

function buildInitialOtherSettings(product) {
  const full = parseFullSettings(product)

  const other =
    full?.other_settings ?? {}

  return {
    customize_button_url:
      other.customize_button_url || '',

    social_proof_text:
      other.social_proof_text || '',
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