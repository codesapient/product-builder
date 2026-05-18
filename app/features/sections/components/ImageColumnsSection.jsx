// app/features/sections/components/ImageColumnsSection.jsx

import { useState } from "react";
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
  Divider,
  Text,
  Card,
  Banner,
  Box,
  Icon,
  Collapsible,
} from "@shopify/polaris";
import { PlusIcon, ImageIcon } from "@shopify/polaris-icons";

import SortableAccordionHeader from "./SortableAccordionHeader";
import MediaUploadField from "./media/MediaUploadField";

const MAX_IMAGE_COLUMNS = 16;

const isImageColumnComplete = (column) =>
  Boolean(column?.title?.trim()) && Boolean(column?.imageUrl?.trim());

// ─── Per-column default factory ───────────────────────────────────────────────
export const createImageColumn = () => ({
  id: crypto.randomUUID(),
  imageUrl: "",
  imageAlt: "",
  title: "",
  description: "",
});

// ─── Upload helper ────────────────────────────────────────────────────────────
// ─── Single column editor ─────────────────────────────────────────────────────
function ImageColumnEditor({
  column,
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

  const displayTitle = column.title?.trim() || "Image title required";

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

                {validationError && (
                  <Banner tone="critical">
                    Add an image and title before closing this column, or delete
                    the column.
                  </Banner>
                )}

                <MediaUploadField
                  value={column.imageUrl}
                  alt={column.imageAlt || "uploaded image"}
                  onChange={(imageUrl) => onChange(column.id, { imageUrl })}
                />

                <TextField
                  label="Title"
                  value={column.title}
                  onChange={(val) => onChange(column.id, { title: val })}
                  placeholder="Column title"
                  autoComplete="off"
                />

                <TextField
                  label="Description"
                  value={column.description}
                  onChange={(val) => onChange(column.id, { description: val })}
                  placeholder="Column description"
                  multiline={3}
                  autoComplete="off"
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
export default function ImageColumnsSection({ section, onChange }) {
  const columns = section.columns ?? [];
  const sensors = useSensors(useSensor(PointerSensor));

  // ── Single open column ID — null means all collapsed ─────────────────────
  const [openColumnId, setOpenColumnId] = useState(
    () => columns[0]?.id ?? null,
  );
  const [validationErrorColumnId, setValidationErrorColumnId] = useState(null);

  const handleToggle = (id) => {
    setOpenColumnId((prev) => {
      const columnToClose = columns.find((column) => column.id === prev);

      if (columnToClose && !isImageColumnComplete(columnToClose)) {
        setValidationErrorColumnId(prev);
        return prev;
      }

      setValidationErrorColumnId(null);
      return prev === id ? null : id;
    });
  };

  const handleAddColumn = () => {
    if (columns.length >= MAX_IMAGE_COLUMNS) return;

    const openColumn = columns.find((column) => column.id === openColumnId);
    if (openColumn && !isImageColumnComplete(openColumn)) {
      setValidationErrorColumnId(openColumn.id);
      return;
    }

    const newColumn = createImageColumn();
    onChange({ columns: [...columns, newColumn] });
    setValidationErrorColumnId(null);
    setOpenColumnId(newColumn.id); // auto-open the new column
  };

  const handleRemoveColumn = (id) => {
    const remaining = columns.filter((c) => c.id !== id);
    onChange({ columns: remaining });
    setValidationErrorColumnId((prev) => (prev === id ? null : prev));
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
      validationErrorColumnId === id &&
      isImageColumnComplete(updatedColumn)
    ) {
      setValidationErrorColumnId(null);
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
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text variant="headingSm" as="h3">
            Image columns
          </Text>
          <Text variant="bodySm" tone="subdued">
            {columns.length} / {MAX_IMAGE_COLUMNS} columns
          </Text>
        </BlockStack>

        <Button
          icon={PlusIcon}
          onClick={handleAddColumn}
          disabled={columns.length >= MAX_IMAGE_COLUMNS}
          size="slim"
        >
          Add column
        </Button>
      </InlineStack>

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
            {columns.map((column) => (
              <ImageColumnEditor
                key={column.id}
                column={column}
                isOpen={openColumnId === column.id}
                onToggle={() => handleToggle(column.id)}
                onChange={handleColumnChange}
                onRemove={handleRemoveColumn}
                validationError={validationErrorColumnId === column.id}
              />
            ))}
          </BlockStack>
        </SortableContext>
      </DndContext>
    </BlockStack>
  );
}
