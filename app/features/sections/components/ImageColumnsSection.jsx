// app/features/sections/components/ImageColumnsSection.jsx

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BlockStack,
  InlineStack,
  TextField,
  Button,
  ButtonGroup,
  Divider,
  Text,
  Card,
  Box,
  Icon,
  Collapsible,
} from "@shopify/polaris";
import { PlusIcon, ImageIcon } from "@shopify/polaris-icons";

import RichTextField from "../../../components/RichTextField";

import SortableAccordionHeader from "./SortableAccordionHeader";
import MediaUploadField from "./media/MediaUploadField";
import { getRequiredColumnFields, validateColumn, getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";

const MAX_IMAGE_COLUMNS = 16;

const isImageColumnComplete = (column) => {
  const requiredFields = getRequiredColumnFields();
  return requiredFields.every(
    (field) => column[field]?.trim?.() || column[field]
  );
};

// ─── Per-column default factory ───────────────────────────────────────────────
export const createImageColumn = () => ({
  id: crypto.randomUUID(),
  imageUrl: "",
  title: "",
  description: "",
});

// ─── Upload helper ────────────────────────────────────────────────────────────
// ─── Single column editor ─────────────────────────────────────────────────────
function ImageColumnEditor({
  column,
  columnIndex,
  isOpen,
  onToggle,
  onChange,
  onRemove,
  validationError,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const columnNumber = columnIndex + 1;
  const displayTitle = column.title?.trim()
    ? `Column ${columnNumber} - ${column.title}`
    : `Column ${columnNumber}`;

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <BlockStack gap="0">
          {/* ── Accordion header ── */}
          <SortableAccordionHeader
            title={displayTitle}
            expanded={isOpen}
            onToggle={onToggle}
            onDelete={() => onRemove(column.id)}
            dragAttributes={attributes}
            dragListeners={listeners}
            controlsId={`column-${column.id}`}
            titleAs="h4"
            titleTone="subdued"
            toggleAccessibilityLabel={`Toggle ${displayTitle}`}
            deleteAccessibilityLabel={`Remove ${displayTitle}`}
          />

          {/* ── Collapsible body ── */}
          <Collapsible open={isOpen} id={`column-${column.id}`}>
            <Box paddingBlockStart="300">
              <BlockStack gap="300">
                <Divider />

                <MediaUploadField
                  value={column.imageUrl}
                  alt={column.imageAlt || "uploaded image"}
                  onChange={(imageUrl) => onChange(column.id, { imageUrl })}
                  error={validationError && !column.imageUrl?.trim?.() ? "Image is required" : ""}
                />

                <TextField
                  label="Title"
                  value={column.title}
                  onChange={(val) => onChange(column.id, { title: val })}
                  placeholder="Image title"
                  autoComplete="off"
                  error={validationError && !column.title?.trim?.() ? "Title is required" : ""}
                />

                <RichTextField
                  label="Description"
                  value={column.description}
                  onChange={(val) => onChange(column.id, { description: val })}
                />
              </BlockStack>
            </Box>
          </Collapsible>
        </BlockStack>
      </Card>
    </div>
  );
}

// ─── Main section component ───────────────────────────────────────────────────
export default function ImageColumnsSection({ section, onChange, onSaved, onValidate }) {
  const [headingError, setHeadingError] = useState('')
  const columns = useMemo(() => section.columns ?? [], [section.columns]);
  const sensors = useSensors(useSensor(PointerSensor));

  // ── Single open column ID — null means all collapsed ─────────────────────
  const [openColumnId, setOpenColumnId] = useState(
    () => columns[0]?.id ?? null,
  );
  const [validationErrorColumnIds, setValidationErrorColumnIds] = useState(new Set());

  // Validate all columns when validation is triggered
  useEffect(() => {
    if (onValidate === 0) return;

    const sectionRequiredFields = getRequiredFields(SECTION_TYPES.TEXT_COLUMNS_WITH_IMAGES)
    setHeadingError(sectionRequiredFields.includes('heading') && !section.heading?.trim() ? 'Heading is required' : '')

    const errorColumnIds = new Set();
    columns.forEach((column) => {
      const errors = validateColumn(column);
      if (errors.length > 0) {
        errorColumnIds.add(column.id);
      }
    });
    setValidationErrorColumnIds(errorColumnIds);
    // Open the first error column for visibility.
    if (errorColumnIds.size > 0) {
      const firstErrorColumn = columns.find((col) => errorColumnIds.has(col.id));
      if (firstErrorColumn) {
        setOpenColumnId(firstErrorColumn.id);
      }
    }
  }, [onValidate, columns, section.heading]);

  // Collapse all columns when saved
  useEffect(() => {
    if (onSaved === 0) return;

    setOpenColumnId(null);
    setValidationErrorColumnIds(new Set());
    setHeadingError('')
  }, [onSaved]);

  const handleToggle = (id) => {
    setOpenColumnId((prev) => {
      const columnToClose = columns.find((column) => column.id === prev);

      if (columnToClose && !isImageColumnComplete(columnToClose)) {
        setValidationErrorColumnIds((prevIds) => new Set([...prevIds, prev]));
        return prev;
      }

      setValidationErrorColumnIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.delete(prev);
        return newIds;
      });
      return prev === id ? null : id;
    });
  };

  const handleAddColumn = () => {
    if (columns.length >= MAX_IMAGE_COLUMNS) return;

    const openColumn = columns.find((column) => column.id === openColumnId);
    if (openColumn && !isImageColumnComplete(openColumn)) {
      setValidationErrorColumnIds((prevIds) => new Set([...prevIds, openColumn.id]));
      return;
    }

    const newColumn = createImageColumn();
    onChange({ columns: [...columns, newColumn] });
    setValidationErrorColumnIds(new Set());
    setOpenColumnId(newColumn.id); // auto-open the new column
  };

  const handleRemoveColumn = (id) => {
    const remaining = columns.filter((c) => c.id !== id);
    onChange({ columns: remaining });
    setValidationErrorColumnIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(id);
      return newIds;
    });
    // if deleted column was open, open the last remaining one
    if (openColumnId === id) {
      setOpenColumnId(remaining[remaining.length - 1]?.id ?? null);
    }
  };

  const handleColumnChange = (id, changes) => {
    const updatedColumn = {
      ...columns.find((column) => column.id === id),
      ...changes,
    };

    if (
      validationErrorColumnIds.has(id) &&
      isImageColumnComplete(updatedColumn)
    ) {
      setValidationErrorColumnIds((prevIds) => {
        const newIds = new Set(prevIds);
        newIds.delete(id);
        return newIds;
      });
    }

    onChange({
      columns: columns.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((c) => c.id === active.id);
    const newIndex = columns.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange({ columns: arrayMove(columns, oldIndex, newIndex) });
  };

  return (
    <BlockStack gap="400">
      <Divider />

      {/* Section header */}
      <BlockStack gap="300">
        <TextField
          label="Heading"
          value={section.heading || ""}
          onChange={(val) => {
            onChange({ heading: val })
            if (val.trim()) setHeadingError('')
          }}
          placeholder="Section heading"
          autoComplete="off"
          error={headingError}  // add this
        />

        <div>
          <Text variant="bodySm" as="span">
            Image Alignment
          </Text>
          <ButtonGroup variant="segmented">
            <Button
              pressed={section.imageAlignment === "left" || !section.imageAlignment}
              onClick={() => onChange({ imageAlignment: "left" })}
            >
              Left
            </Button>
            <Button
              pressed={section.imageAlignment === "right"}
              onClick={() => onChange({ imageAlignment: "right" })}
            >
              Right
            </Button>
          </ButtonGroup>
        </div>

      <Box paddingBlockStart="400">
        <InlineStack align="center" blockAlign="center" gap="300">
          <Button
            icon={PlusIcon}
            onClick={handleAddColumn}
            disabled={columns.length >= MAX_IMAGE_COLUMNS}
            size="slim"
          >
            Add column
          </Button>
          <Text variant="bodySm" tone="subdued">
            {columns.length} / {MAX_IMAGE_COLUMNS} columns
          </Text>
        </InlineStack>
        </Box>
      </BlockStack>

      {/* Empty state */}
      {columns.length === 0 && (
        <Card>
          <BlockStack gap="200" inlineAlign="center">
            <Icon source={ImageIcon} tone="subdued" />
            <Text variant="bodySm" tone="subdued" alignment="center">
              No columns yet. Click &quot;Add column&quot; to get started.
            </Text>
          </BlockStack>
        </Card>
      )}

      {/* Column accordions */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((column) => column.id)}
          strategy={verticalListSortingStrategy}
        >
          <BlockStack gap="200">
            {columns.map((column, index) => (
              <ImageColumnEditor
                key={column.id}
                column={column}
                columnIndex={index}
                isOpen={openColumnId === column.id}
                onToggle={() => handleToggle(column.id)}
                onChange={handleColumnChange}
                onRemove={handleRemoveColumn}
                validationError={validationErrorColumnIds.has(column.id)}
              />
            ))}
          </BlockStack>
        </SortableContext>
      </DndContext>
    </BlockStack>
  );
}
