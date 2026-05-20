// app/features/sections/components/SectionsList.jsx

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Page,
  Layout,
  Card,
  Button,
  Banner,
  BlockStack,
  Icon,
  Text,
  Collapsible,
  InlineStack,
} from '@shopify/polaris'
import { ArrowLeftIcon, ViewIcon, ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSections } from '../hooks/useSections'
import { useProductMetafield } from '../hooks/useProductMetafield'
import { deserializeSections } from '../utils'
import { SECTION_TYPES } from '../types'
import { getSectionMeta } from '../sectionRegistry'
import { validateSection } from '../schema'
import SectionItem from './SectionItem'
import DraggableAddButton from './sectionListSettings/DraggableAddButton'
import DropZoneIndicator from './sectionListSettings/DropZoneIndicator'
import { useNavigate } from 'react-router'
import SpecificationsSettings from '../../productSettings/components/SpecificationsSettings'
import BadgeSettings from '../../productSettings/components/BadgeSettings'
import ProductSettings from '../../productSettings/ProductSettings'

// ── Declare which section types appear in the "Add section" panel ─────────────

const ADD_SECTION_MENU = [
  SECTION_TYPES.IMAGE,
  SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES,
  SECTION_TYPES.VIDEO,
  SECTION_TYPES.BANNER_WITH_TEXT,
  SECTION_TYPES.SPACER,
  SECTION_TYPES.DIVIDER,
  SECTION_TYPES.RICH_TEXT,
  SECTION_TYPES.ACCORDION,
  SECTION_TYPES.THICKNESS_CHART,
  SECTION_TYPES.VIDEO_GALLERY,
]

export default function SectionsList({ product }) {
  const initialSections = deserializeSections(product?.metafield?.value)
  const { sections, addSection, addSectionAtIndex, removeSection, duplicateSection, updateSection, reorderSections } =
    useSections(initialSections)
  const { saveSections, isSaving, isSuccess, saveSectionsError } = useProductMetafield()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )
  const [savedTrigger, setSavedTrigger] = useState(0)
  const [validationErrors, setValidationErrors] = useState([])
  const [invalidSectionIds, setInvalidSectionIds] = useState(new Set())
  const [showValidationTrigger, setShowValidationTrigger] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [showDropZone, setShowDropZone] = useState(null)
  const [openLeftAccordion, setOpenLeftAccordion] = useState('productSettings')
  const isProductSettingsOpen = openLeftAccordion === 'productSettings'
  const isAddSectionOpen = openLeftAccordion === 'addSection'
  const prevLeftAccordionRef = useRef(openLeftAccordion)
  const [activePanel, setActivePanel] = useState('sections') // 'sections' | 'specifications'

  const producTitleRaw = product?.title?.trim()
  const productTitle = producTitleRaw?.length > 20 ? `${producTitleRaw.slice(0, 50)}...` : producTitleRaw

  const navigate = useNavigate()
  const storefrontUrl = product?.storeUrl?.replace(/\/$/, '')
  const productPreviewUrl =
    product?.onlineStorePreviewUrl ||
    product?.onlineStoreUrl ||
    (storefrontUrl && product?.handle ? `${storefrontUrl}/products/${product.handle}` : undefined)


  useEffect(() => {
    if (isSuccess && validationErrors.length === 0) setShowSuccess(true)
  }, [isSuccess, validationErrors.length])

  useEffect(() => {
    if (saveSectionsError) setShowSuccess(false)
  }, [saveSectionsError])

  const handleSave = useCallback(() => {
    setShowSuccess(false)

    // Validate all sections
    const errors = []
    const invalidIds = new Set()

    sections.forEach((section, index) => {
      const { isValid, errors: sectionErrors } = validateSection(section)
      if (!isValid) {
        invalidIds.add(section.id)
        errors.push(...sectionErrors.map((err) => `Section ${index + 1}: ${err}`))
      }
    })

    setValidationErrors(errors)
    setInvalidSectionIds(invalidIds)

    if (errors.length > 0) {
      // Show validation errors and trigger validation UI in sections
      setShowValidationTrigger((prev) => prev + 1)
      return
    }

    // All valid, proceed with save
    saveSections(sections)
    setValidationErrors([])
    setInvalidSectionIds(new Set())
    // Trigger collapse of all sections
    setSavedTrigger((prev) => prev + 1)
  }, [sections, saveSections])

  const handleUpdateSection = useCallback((id, changes) => {
    setShowSuccess(false)
    updateSection(id, changes)
  }, [updateSection])

  const handleOpenSpecifications = useCallback(() => {
    setActivePanel('specifications')
  }, [])

  const handleOpenSections = useCallback(() => {
    setActivePanel('sections')
  }, [])

  useEffect(() => {
    const prev = prevLeftAccordionRef.current
    if (prev !== openLeftAccordion) {
      if (openLeftAccordion === 'productSettings') handleOpenSpecifications()
      else handleOpenSections()
      prevLeftAccordionRef.current = openLeftAccordion
    }
  }, [openLeftAccordion, handleOpenSpecifications, handleOpenSections])

  const activateProductSettings = useCallback(() => {
    setOpenLeftAccordion((prev) => (prev === 'productSettings' ? prev : 'productSettings'))
  }, [])

  const activateAddSection = useCallback(() => {
    setOpenLeftAccordion((prev) => (prev === 'addSection' ? prev : 'addSection'))
  }, [])

  const handleAddSection = useCallback((type) => {
    setShowSuccess(false)
    addSection(type)
  }, [addSection])

  const handleRemoveSection = useCallback((id) => {
    setShowSuccess(false)
    removeSection(id)
    setInvalidSectionIds((prevIds) => {
      const nextIds = new Set(prevIds)
      nextIds.delete(id)
      return nextIds
    })
  }, [removeSection])

  const handleDuplicateSection = useCallback((id) => {
    setShowSuccess(false)
    duplicateSection(id)
  }, [duplicateSection])

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    setShowDropZone(null)
  
    if (!over) return
    setShowSuccess(false)

    const isAddingSection = active.id?.toString().startsWith('add-')

    if (isAddingSection) {
      const sectionType = active.data.current?.type
      if (!sectionType) return
      const foundIndex = sections.findIndex((s) => s.id === over.id)
      const insertIndex = foundIndex !== -1 ? foundIndex : sections.length
      addSectionAtIndex(sectionType, insertIndex)
    } else if (active.id !== over.id) {
      reorderSections(active.id, over.id)
    }
  }

  const handleDragStart = ({ active }) => {
    setActiveId(active.id)
  }

  const handleDragOver = ({ over }) => {
    if (over && !over.id?.toString().startsWith('add-')) {
      setShowDropZone(over.id)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setShowDropZone(null)
  }

  const activeDragItem = activeId?.toString().startsWith('add-')
    ? (() => {
        const type = activeId.toString().replace('add-', '')
        const meta = getSectionMeta(type)
        return (
          <Card>
            <BlockStack gap="300">
              {/* Mimics SortableAccordionHeader layout */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
              }}>
                {/* Drag handle placeholder */}
                <div style={{ width: '40px', opacity: 0.3 }}>⠿</div>
                <Icon source={meta.icon} tone={meta.tone} />
                <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>
                  {meta.label}
                </span>
              </div>
            </BlockStack>
          </Card>
        )
      })()
    : null

  return (
    <Page
      title={productTitle}
      backAction={{
        content: 'Home',
        icon: ArrowLeftIcon,
        onAction: () => navigate('/app'),
      }}
      secondaryActions={[
        {
          content: 'View product',
          icon: ViewIcon,
          url: productPreviewUrl,
          external: true,
          disabled: !productPreviewUrl,
          accessibilityLabel: 'View product in online store',
        },
      ]}
    >
      <BlockStack gap="400">
        <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragCancel={handleDragCancel}
            >

          {/* Top row — Product Settings + Add Section side by side */}
          <Layout>
            <Layout.Section variant="oneHalf">
              {/* Navbar */}
              <Card>
                <InlineStack gap="400">
                  <Button
                    variant={activePanel === 'specifications' ? 'primary' : 'plain'}
                    onClick={handleOpenSpecifications}
                  >
                    Product Settings
                  </Button>
                  <Button
                    variant={activePanel === 'sections' ? 'primary' : 'plain'}
                    onClick={handleOpenSections}
                  >
                    Manage Sections
                  </Button>
                </InlineStack>
              </Card>
            </Layout.Section>
          </Layout>

          {/* Bottom — Sections list / Specifications (full width) */}
          {activePanel === 'specifications' ? (
            <ProductSettings product={product} storeUrl={product.storeUrl} />
          ) : (

            <Layout>
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="300">
                      <Text variant="headingSm" as="h2">Add a section</Text>
                      <Text variant="bodySm" tone="subdued">
                        Choose a section type to add to this product page.
                      </Text>
                      {ADD_SECTION_MENU.map((type) => {
                        const { label, icon: SectionIcon, tone } = getSectionMeta(type)
                        return (
                          <DraggableAddButton
                            key={type}
                            type={type}
                            label={label}
                            icon={SectionIcon}
                            tone={tone}
                            onClickAdd={handleAddSection}
                          />
                        )
                      })}
                    </BlockStack>
                  </Card>
                </Layout.Section>

                <Layout.Section>
                  <Card>

                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="center" gap="400" wrap>
                        <Text variant="headingSm" as="h2">Page sections</Text>
                        <Button variant="primary" loading={isSaving} onClick={handleSave}>
                          Save sections
                        </Button>
                      </InlineStack>

                      {validationErrors.length > 0 && (
                        <Banner tone="critical" title="Please fix validation errors:">
                          {validationErrors.map((error, idx) => (
                            <div key={idx}>{error}</div>
                          ))}
                        </Banner>
                      )}
                      {!isSaving &&
                        saveSectionsError &&
                        validationErrors.length === 0 && (
                          <Banner tone="critical" title="Sections could not be saved">
                            {saveSectionsError}
                          </Banner>
                        )}
                      {showSuccess &&
                        validationErrors.length === 0 &&
                        !saveSectionsError && (
                          <Banner tone="success" title="Sections saved successfully!" />
                        )}

                      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
                        <SortableContext
                          items={sections.map((s) => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <BlockStack gap="300">
                            {sections.length === 0 ? (
                              <Card>
                                <Text variant="bodySm" tone="subdued" alignment="center">
                                  No sections yet. Add one from the panel above.
                                </Text>
                              </Card>
                            ) : (
                              sections.map((section) => (
                                <div key={section.id}>
                                  {showDropZone === section.id && activeId?.toString().startsWith('add-') && (
                                    <DropZoneIndicator />
                                  )}
                                  <SectionItem
                                    key={section.id}
                                    section={section}
                                    onUpdate={handleUpdateSection}
                                    onRemove={handleRemoveSection}
                                    onDuplicate={handleDuplicateSection}
                                    savedTrigger={savedTrigger}
                                    validationTrigger={showValidationTrigger}
                                    hasValidationError={invalidSectionIds.has(section.id)}
                                  />
                                </div>
                              ))
                            )}
                          </BlockStack>
                        </SortableContext>
                      </div>
                    </BlockStack>
                  </Card>
                </Layout.Section>

            </Layout>
          )}

          <DragOverlay dropAnimation={null}>
            {activeDragItem}
          </DragOverlay>

        </DndContext>

      </BlockStack>
    </Page>
  )
}