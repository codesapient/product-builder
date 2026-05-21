import { useCallback, useMemo } from 'react'

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
  DeleteIcon,
  DragHandleIcon,
} from '@shopify/polaris-icons'

import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

function SortableSpecification({
  id,
  row,
  index,
  totalItems,
  handleChange,
  handleRemove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform:
      CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: '100%',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <InlineStack
        gap="300"
        wrap={false}
        blockAlign="end"
        align="start"
      >

        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            paddingBottom: '8px',
            flexShrink: 0,
          }}
        >
          <Button
            icon={DragHandleIcon}
            variant="tertiary"
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
                ? 'Name'
                : undefined
            }
            labelHidden={index !== 0}
            placeholder="e.g. Material"
            value={row.name}
            onChange={(v) =>
              handleChange(
                row.id,
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
                row.id,
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
            flexShrink: 0,
          }}
        >
          <Button
            icon={DeleteIcon}
            variant="plain"
            tone="critical"
            accessibilityLabel="Remove specification"
            onClick={() =>
              handleRemove(row.id)
            }
            disabled={totalItems === 1}
          />
        </div>

      </InlineStack>
    </div>
  )
}

export default function SpecificationsSettings({
  value = [],
  onChange,
}) {

  const normalizedValue = useMemo(() => {
    return value.map((row) => ({
      id:
        row.id ||
        crypto.randomUUID(),
      name: row.name || '',
      value: row.value || '',
    }))
  }, [value])

  const handleChange = useCallback(
    (id, field, fieldValue) => {

      const updated =
        normalizedValue.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: fieldValue,
              }
            : row
        )

      onChange(updated)
    },
    [normalizedValue, onChange]
  )

  const handleAdd = useCallback(() => {
    onChange([
      ...normalizedValue,
      {
        id: crypto.randomUUID(),
        name: '',
        value: '',
      },
    ])
  }, [normalizedValue, onChange])

  const handleRemove = useCallback(
    (id) => {
      onChange(
        normalizedValue.filter(
          (row) => row.id !== id
        )
      )
    },
    [normalizedValue, onChange]
  )

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event

      if (
        !over ||
        active.id === over.id
      ) {
        return
      }

      const oldIndex =
        normalizedValue.findIndex(
          (row) =>
            row.id === active.id
        )

      const newIndex =
        normalizedValue.findIndex(
          (row) =>
            row.id === over.id
        )

      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return
      }

      onChange(
        arrayMove(
          normalizedValue,
          oldIndex,
          newIndex
        )
      )
    },
    [normalizedValue, onChange]
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
            Specifications
          </Text>
        </InlineStack>

        <Divider />

        <DndContext
          collisionDetection={
            closestCenter
          }
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={normalizedValue.map(
              (row) => row.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >

            <BlockStack gap="300">

              {normalizedValue.map(
                (row, index) => (
                  <SortableSpecification
                    key={row.id}
                    id={row.id}
                    row={row}
                    index={index}
                    totalItems={
                      normalizedValue.length
                    }
                    handleChange={
                      handleChange
                    }
                    handleRemove={
                      handleRemove
                    }
                  />
                )
              )}

            </BlockStack>

          </SortableContext>

        </DndContext>

        <InlineStack align="center">
          <Button onClick={handleAdd}>
            + Add specification
          </Button>
        </InlineStack>

      </BlockStack>
    </Card>
  )
}