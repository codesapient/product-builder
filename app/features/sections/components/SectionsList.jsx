// app/features/sections/components/SectionsList.jsx

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Page, Layout, Card, Button, Box, Banner, BlockStack, Text, Icon } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons'

import { useSections } from '../hooks/useSections'
import { useProductMetafield } from '../hooks/useProductMetafield'
import { deserializeSections } from '../utils'
import { SECTION_TYPES } from '../types'
import { getSectionMeta } from '../sectionRegistry'
import SectionItem from './SectionItem'

// ── Declare which section types appear in the "Add section" panel ─────────────

const ADD_SECTION_MENU = [
  SECTION_TYPES.IMAGE,
  SECTION_TYPES.VIDEO,
  SECTION_TYPES.IMAGE_COLUMNS,
]

export default function SectionsList({ product }) {
  const initialSections = deserializeSections(product?.metafield?.value)
  const { sections, addSection, removeSection, updateSection, reorderSections } =
    useSections(initialSections)
  const { saveSections, isSaving, isSuccess } = useProductMetafield()
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) reorderSections(active.id, over.id)
  }

  return (
    <Page
      title={product?.title}
      primaryAction={{
        content: 'Save sections',
        loading: isSaving,
        onAction: () => saveSections(sections),
      }}
    >
      <BlockStack gap="400">
        {isSuccess && <Banner tone="success" title="Sections saved successfully!" />}

        <Layout>
          {/* Left — Add section */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h2">Add section</Text>
                <Text variant="bodySm" tone="subdued">
                  Choose a section type to add to this product page.
                </Text>

                {ADD_SECTION_MENU.map((type) => {
                  const { label, icon } = getSectionMeta(type)
                  return (
                    <Button
                      fullWidth
                      icon={PlusIcon}
                      onClick={() => addSection(type)}
                      textAlign="left"
                    >
                      <span style={{ paddingBlock: "4px", display: "block" }}>
                        {label}
                      </span>
                    </Button>
                  )
                })}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Right — Sections list */}
          <Layout.Section>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <BlockStack gap="300">
                  {sections.length === 0 ? (
                    <Card>
                      <Text variant="bodySm" tone="subdued" alignment="center">
                        No sections yet. Add one from the left panel.
                      </Text>
                    </Card>
                  ) : (
                    sections.map((section) => (
                      <SectionItem
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onRemove={removeSection}
                      />
                    ))
                  )}
                </BlockStack>
              </SortableContext>
            </DndContext>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}