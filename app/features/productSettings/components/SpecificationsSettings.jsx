import { useCallback } from 'react'

import {
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  Text,
  TextField,
} from '@shopify/polaris'

import { DeleteIcon } from '@shopify/polaris-icons'

export default function SpecificationsSettings({
  value,
  onChange,
}) {

  const handleChange = useCallback(
    (index, field, fieldValue) => {

      const updated = value.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: fieldValue,
            }
          : row
      )

      onChange(updated)
    },
    [value, onChange]
  )

  const handleAdd = useCallback(() => {
    onChange([
      ...value,
      {
        name: '',
        value: '',
      },
    ])
  }, [value, onChange])

  const handleRemove = useCallback(
    (index) => {
      onChange(
        value.filter((_, i) => i !== index)
      )
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
          <Text variant="headingMd" as="h2">
            Specifications
          </Text>
        </InlineStack>

        <Divider />

        <BlockStack gap="300">

          {value.map((row, index) => (
            <InlineStack
              key={index}
              gap="300"
              wrap={false}
              blockAlign="end"
            >

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <TextField
                  label={
                    index === 0
                      ? 'Name'
                      : undefined
                  }
                  labelHidden={index !== 0}
                  placeholder="e.g. Material"
                  value={row.name}
                  onChange={(v) =>
                    handleChange(
                      index,
                      'name',
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
                  label={
                    index === 0
                      ? 'Value'
                      : undefined
                  }
                  labelHidden={index !== 0}
                  placeholder="e.g. Acrylic"
                  value={row.value}
                  onChange={(v) =>
                    handleChange(
                      index,
                      'value',
                      v
                    )
                  }
                  autoComplete="off"
                />
              </div>

              <div
                style={{
                  paddingBottom: '2px',
                }}
              >
                <Button
                  icon={DeleteIcon}
                  variant="plain"
                  tone="critical"
                  accessibilityLabel="Remove specification"
                  onClick={() =>
                    handleRemove(index)
                  }
                  disabled={value.length === 1}
                />
              </div>

            </InlineStack>
          ))}

        </BlockStack>

        <InlineStack align="center">
          <Button onClick={handleAdd}>
            + Add specification
          </Button>
        </InlineStack>

      </BlockStack>
    </Card>
  )
}