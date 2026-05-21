// app/routes/app.product-settings/components/OtherSettings.jsx

import { useCallback } from 'react'

import {
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Text,
} from '@shopify/polaris'

import { useFetcher } from 'react-router'

import UrlPicker from './UrlPicker'

import RichTextField from '../../../components/RichTextField'

export default function OtherSettings({
  storeUrl,
  value,
  onChange,
}) {

  const fetcher = useFetcher()

  const handleChange = useCallback(
    (field, fieldValue) => {

      onChange({
        ...value,
        [field]: fieldValue,
      })

    },
    [value, onChange]
  )

  return (
    <Card>

      <BlockStack gap="300">

        <InlineStack
          align="space-between"
          blockAlign="center"
        >

          <Text
            variant="headingMd"
            as="h2"
          >
            Other Settings
          </Text>

        </InlineStack>

        <Divider />

        {/* Customize URL Button */}

        <UrlPicker
          storeUrl={storeUrl}
          value={
            value?.customize_button_url ?? ''
          }
          onChange={(url) =>
            handleChange(
              'customize_button_url',
              url
            )
          }
          fetcher={fetcher}
          label="Customize Button URL"
        />

        <BlockStack gap="300">

          {/* Social Proof */}

          <RichTextField
            label="Social Proof"
            value={
              value?.social_proof_text ?? ''
            }
            onChange={(html) =>
              handleChange(
                'social_proof_text',
                html
              )
            }
          />

          <Text
            as="p"
            tone="subdued"
            variant="bodySm"
          >
            Example:
            {' '}
            500+
            {' '}
            &lt;strong&gt;bought&lt;/strong&gt;
            {' '}
            past month
          </Text>

        </BlockStack>

      </BlockStack>

    </Card>
  )
}