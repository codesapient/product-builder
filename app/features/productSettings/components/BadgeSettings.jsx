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

         <Divider />

        <TextField
          label="Text"
          placeholder="#1 Best Seller"
          value={value.text}
          onChange={(v) =>
            handleChange(
              'text',
              v
            )
          }
          autoComplete="off"
        />

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
                label="Category"
                placeholder="In Custom Cut Glass"
                value={value.category}
                onChange={(v) =>
                  handleChange(
                    'category',
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

              <UrlPicker
                storeUrl={storeUrl}
                value={value.category_url}
                onChange={(url) =>
                  handleChange(
                    'category_url',
                    url
                  )
                }
                fetcher={fetcher}
                label="Category URL"
              />

            </div>

          </InlineStack>

        </BlockStack>
      </BlockStack>
    </Card>
  )
}