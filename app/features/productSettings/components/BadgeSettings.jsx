import { useCallback, useEffect, useRef, useState } from 'react'

import {
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  Spinner,
  Text,
  TextField,
} from '@shopify/polaris'



import { useFetcher } from 'react-router'
import UrlPicker from './UrlPicker'
/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export default function BadgeSettings({
  product,
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
          blockAlign="start"
          gap="400"
          wrap
        >

          <Text
            variant="headingMd"
            as="h2"
          >
            Badge
          </Text>

        </InlineStack>

        <UrlPicker
          storeUrl={storeUrl}
          value={value.badge_url}
          onChange={(url) =>
            handleChange(
              'badge_url',
              url
            )
          }
          fetcher={fetcher}
        />

        <Divider />

        <BlockStack gap="200">

          <InlineStack
            gap="300"
            wrap={false}
            blockAlign="start"
          >

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >

              <TextField
                label="Badge Text"

                placeholder="e.g. Top Rated"

                value={value.badge_text}

                onChange={(v) =>
                  handleChange(
                    'badge_text',
                    v
                  )
                }

                autoComplete="off"
              />

            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >

              <TextField
                label="Badge Category"

                placeholder="e.g. Award"

                value={value.badge_category}

                onChange={(v) =>
                  handleChange(
                    'badge_category',
                    v
                  )
                }

                autoComplete="off"
              />

            </div>

          </InlineStack>

        </BlockStack>
      </BlockStack>
    </Card>
  )
}