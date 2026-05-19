import { useEffect, useMemo, useState } from "react";
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
  Box,
  Button,
  Card,
  Collapsible,
  Divider,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";

import SortableAccordionHeader from "./SortableAccordionHeader";
import {
  getRequiredFields,
  validateAccordionItem,
  validateAccordionRow,
} from "../schema";
import { SECTION_TYPES } from "../types";

const MAX_ACCORDION_ITEMS = 12;
const MAX_ROWS_PER_ITEM = 10;

const createAccordionItem = () => ({
  id: crypto.randomUUID(),
  heading: "",
  rows: [{ id: crypto.randomUUID(), name: "", value: "" }],
});

const createNameValueRow = () => ({
  id: crypto.randomUUID(),
  name: "",
  value: "",
});

const isAccordionItemComplete = (item) =>
  validateAccordionItem(item).length === 0;

function AccordionItemEditor({
  item,
  itemIndex,
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
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const rows = item.rows ?? [];
  const displayTitle = item.heading?.trim()
    ? `Accordion ${itemIndex + 1} - ${item.heading}`
    : `Accordion ${itemIndex + 1}`;

  const updateRow = (rowId, changes) => {
    onChange(item.id, {
      rows: rows.map((row) =>
        row.id === rowId ? { ...row, ...changes } : row,
      ),
    });
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS_PER_ITEM) return;
    onChange(item.id, { rows: [...rows, createNameValueRow()] });
  };

  const removeRow = (rowId) => {
    if (rows.length <= 1) return;
    onChange(item.id, { rows: rows.filter((row) => row.id !== rowId) });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <BlockStack gap="0">
          <SortableAccordionHeader
            title={displayTitle}
            expanded={isOpen}
            onToggle={onToggle}
            onDelete={() => onRemove(item.id)}
            dragAttributes={attributes}
            dragListeners={listeners}
            controlsId={`accordion-item-${item.id}`}
            titleAs="h4"
            titleTone="subdued"
            toggleAccessibilityLabel={`Toggle ${displayTitle}`}
            deleteAccessibilityLabel={`Remove ${displayTitle}`}
          />

          <Collapsible open={isOpen} id={`accordion-item-${item.id}`}>
            <Box paddingBlockStart="300">
              <BlockStack gap="300">
                <Divider />

                <TextField
                  label="Item heading"
                  value={item.heading || ""}
                  onChange={(heading) => onChange(item.id, { heading })}
                  placeholder="Measurements"
                  autoComplete="off"
                  error={
                    validationError && !item.heading?.trim?.()
                      ? "Item heading is required"
                      : ""
                  }
                />

                <BlockStack gap="200">
                  <Text variant="headingSm" as="h5">
                    Rows
                  </Text>

                  {rows.map((row, index) => {
                    const rowHasError =
                      validationError && validateAccordionRow(row).length > 0;

                    return (
                      <div
                        key={row.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto",
                          gap: "12px",
                          alignItems: "start",
                        }}
                      >
                        <TextField
                          label={`Name ${index + 1}`}
                          labelHidden
                          value={row.name || ""}
                          onChange={(name) => updateRow(row.id, { name })}
                          placeholder="Color"
                          autoComplete="off"
                          error={
                            rowHasError && !row.name?.trim?.()
                              ? "Name is required"
                              : ""
                          }
                        />
                        <TextField
                          label={`Value ${index + 1}`}
                          labelHidden
                          value={row.value || ""}
                          onChange={(value) => updateRow(row.id, { value })}
                          placeholder="Clear"
                          autoComplete="off"
                          error={
                            rowHasError && !row.value?.trim?.()
                              ? "Value is required"
                              : ""
                          }
                        />
                        <Button
                          variant="plain"
                          tone="critical"
                          icon={DeleteIcon}
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length <= 1}
                          accessibilityLabel={`Remove row ${index + 1}`}
                        />
                      </div>
                    );
                  })}

                  <InlineStack align="center" blockAlign="center" gap="300">
                    <Button
                      icon={PlusIcon}
                      onClick={addRow}
                      disabled={rows.length >= MAX_ROWS_PER_ITEM}
                      size="slim"
                      variant="primary"
                    >Add row</Button>
                    <Text variant="bodySm" tone="subdued">
                      {rows.length} / {MAX_ROWS_PER_ITEM} rows
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Box>
          </Collapsible>
        </BlockStack>
      </Card>
    </div>
  );
}

export default function AccordionSection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [headingError, setHeadingError] = useState("");
  const [openItemId, setOpenItemId] = useState(
    () => section.items?.[0]?.id ?? null,
  );
  const [validationErrorItemIds, setValidationErrorItemIds] = useState(
    new Set(),
  );
  const items = useMemo(() => section.items ?? [], [section.items]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (onValidate === 0) return;

    const sectionRequiredFields = getRequiredFields(SECTION_TYPES.ACCORDION);
    setHeadingError(
      sectionRequiredFields.includes("heading") && !section.heading?.trim()
        ? "Heading is required"
        : "",
    );

    const errorItemIds = new Set();
    items.forEach((item) => {
      if (validateAccordionItem(item).length > 0) {
        errorItemIds.add(item.id);
      }
    });

    setValidationErrorItemIds(errorItemIds);
    if (errorItemIds.size > 0) {
      const firstErrorItem = items.find((item) => errorItemIds.has(item.id));
      if (firstErrorItem) setOpenItemId(firstErrorItem.id);
    }
  }, [onValidate, items, section.heading]);

  useEffect(() => {
    if (onSaved === 0) return;

    setOpenItemId(null);
    setValidationErrorItemIds(new Set());
    setHeadingError("");
  }, [onSaved]);

  const handleToggle = (id) => {
    setOpenItemId((prev) => {
      const itemToClose = items.find((item) => item.id === prev);

      if (itemToClose && !isAccordionItemComplete(itemToClose)) {
        setValidationErrorItemIds((prevIds) => new Set([...prevIds, prev]));
        return prev;
      }

      setValidationErrorItemIds((prevIds) => {
        const nextIds = new Set(prevIds);
        nextIds.delete(prev);
        return nextIds;
      });
      return prev === id ? null : id;
    });
  };

  const handleAddItem = () => {
    if (items.length >= MAX_ACCORDION_ITEMS) return;

    const openItem = items.find((item) => item.id === openItemId);
    if (openItem && !isAccordionItemComplete(openItem)) {
      setValidationErrorItemIds((prevIds) => new Set([...prevIds, openItem.id]));
      return;
    }

    const newItem = createAccordionItem();
    onChange({ items: [...items, newItem] });
    setValidationErrorItemIds(new Set());
    setOpenItemId(newItem.id);
  };

  const handleRemoveItem = (id) => {
    const remaining = items.filter((item) => item.id !== id);
    onChange({ items: remaining });
    setValidationErrorItemIds((prevIds) => {
      const nextIds = new Set(prevIds);
      nextIds.delete(id);
      return nextIds;
    });
    if (openItemId === id) {
      setOpenItemId(remaining[remaining.length - 1]?.id ?? null);
    }
  };

  const handleItemChange = (id, changes) => {
    const updatedItem = {
      ...items.find((item) => item.id === id),
      ...changes,
    };

    if (
      validationErrorItemIds.has(id) &&
      isAccordionItemComplete(updatedItem)
    ) {
      setValidationErrorItemIds((prevIds) => {
        const nextIds = new Set(prevIds);
        nextIds.delete(id);
        return nextIds;
      });
    }

    onChange({
      items: items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange({ items: arrayMove(items, oldIndex, newIndex) });
  };

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Heading"
        value={section.heading || ""}
        onChange={(heading) => {
          onChange({ heading });
          if (heading.trim()) setHeadingError("");
        }}
        placeholder="Product information"
        autoComplete="off"
        error={headingError}
      />

      {items.length === 0 ? (
        <Card>
          <Text variant="bodySm" tone="subdued" alignment="center">
            No accordion items yet. Add one below.
          </Text>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <BlockStack gap="200">
              {items.map((item, index) => (
                <AccordionItemEditor
                  key={item.id}
                  item={item}
                  itemIndex={index}
                  isOpen={openItemId === item.id}
                  onToggle={() => handleToggle(item.id)}
                  onChange={handleItemChange}
                  onRemove={handleRemoveItem}
                  validationError={validationErrorItemIds.has(item.id)}
                />
              ))}
            </BlockStack>
          </SortableContext>
        </DndContext>
      )}

      <Box paddingBlockStart="200">
        <InlineStack align="start" blockAlign="center" gap="300">
          <Button
            icon={PlusIcon}
            onClick={handleAddItem}
            disabled={items.length >= MAX_ACCORDION_ITEMS}
            size="slim"
          >
            Add accordion item
          </Button>
          <Text variant="bodySm" tone="subdued">
            {items.length} / {MAX_ACCORDION_ITEMS} items
          </Text>
        </InlineStack>
      </Box>
    </BlockStack>
  );
}
