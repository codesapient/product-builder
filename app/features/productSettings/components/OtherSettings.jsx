// app/routes/app.product-settings/components/OtherSettings.jsx

import { useCallback, useMemo, useRef, useState } from 'react'

import {
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  Text,
  TextField,
} from '@shopify/polaris'

import {
  TextBoldIcon,
} from '@shopify/polaris-icons'

import { useFetcher } from 'react-router'

import UrlPicker from './UrlPicker'

export default function OtherSettings({
  storeUrl,
  value,
  onChange,
}) {

  const fetcher = useFetcher()

  const editorRef = useRef(null)

  const [isFocused, setIsFocused] =
    useState(false)

  const socialProofHtml =
    value?.social_proof ?? ''

  const plainText = useMemo(() => {

    if (typeof window === 'undefined') {
      return socialProofHtml
    }

    const div = document.createElement('div')

    div.innerHTML = socialProofHtml

    return div.textContent || ''

  }, [socialProofHtml])

  const handleChange = useCallback(
    (field, fieldValue) => {

      onChange({
        ...value,
        [field]: fieldValue,
      })

    },
    [value, onChange]
  )

  const handleBold = () => {

    document.execCommand('bold')

    if (editorRef.current) {

      handleChange(
        'social_proof',
        editorRef.current.innerHTML
      )
    }
  }

  const handleEditorInput = () => {

    if (editorRef.current) {

      handleChange(
        'social_proof',
        editorRef.current.innerHTML
      )
    }
  }

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
            value?.customize_url_button ?? ''
          }

          onChange={(url) =>
            handleChange(
              'customize_url_button',
              url
            )
          }

          fetcher={fetcher}
        />

        <BlockStack gap="300">

          {/* Social Proof */}

          <BlockStack gap="100">

            <InlineStack
              align="space-between"
              blockAlign="center"
            >

              <Text
                as="p"
                variant="bodyMd"
                fontWeight="medium"
              >
                Social Proof
              </Text>

              <Button
                icon={TextBoldIcon}
                variant="tertiary"
                onClick={handleBold}
              >
                Bold
              </Button>

            </InlineStack>

            <div
              style={{
                border:
                  isFocused
                    ? '2px solid var(--p-color-border-emphasis)'
                    : '1px solid var(--p-color-border)',

                borderRadius: 8,

                padding: 12,

                minHeight: 120,

                background:
                  'var(--p-color-bg-surface)',
              }}
            >

              <div
                ref={editorRef}

                contentEditable

                suppressContentEditableWarning

                onInput={handleEditorInput}

                onFocus={() =>
                  setIsFocused(true)
                }

                onBlur={() =>
                  setIsFocused(false)
                }

                dangerouslySetInnerHTML={{
                  __html: socialProofHtml,
                }}

                style={{
                  outline: 'none',
                  minHeight: 90,
                  fontSize: 14,
                  lineHeight: '20px',
                }}
              />

            </div>

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

      </BlockStack>

    </Card>
  )
}