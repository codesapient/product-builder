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
  Button,
  Divider,
  Icon,
  InlineStack,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import {
  DeleteIcon,
  DragHandleIcon,
  DuplicateIcon,
  PlusIcon,
} from "@shopify/polaris-icons";

import RichTextField from "../../../components/RichTextField";
import { getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";

const MAX_THICKNESSES = 20;

const createThickness = () => ({
  id: crypto.randomUUID(),
  value: "",
});

function SortableThicknessRow({
  thickness,
  thicknessIndex,
  validationError,
  canRemove,
  canDuplicate,
  onChange,
  onDuplicate,
  onRemove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: thickness.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
    gap: "12px",
    alignItems: "start",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          minHeight: "32px",
        }}
      >
        <Icon source={DragHandleIcon} tone="subdued" />
      </div>
      <TextField
        label={`Thickness ${thicknessIndex + 1}`}
        labelHidden
        value={thickness.value || ""}
        onChange={(value) => onChange(thickness.id, value)}
        placeholder="1/4"
        autoComplete="off"
        error={
          validationError && !thickness.value?.trim?.()
            ? "Thickness is required"
            : ""
        }
      />
      <Tooltip content="Duplicate">
        <Button
          variant="plain"
          icon={DuplicateIcon}
          onClick={() => onDuplicate(thickness.id)}
          disabled={!canDuplicate}
          accessibilityLabel={`Duplicate thickness ${thicknessIndex + 1}`}
        />
      </Tooltip>
      <Tooltip content="Delete">
        <Button
          variant="plain"
          tone="critical"
          icon={DeleteIcon}
          onClick={() => onRemove(thickness.id)}
          disabled={!canRemove}
          accessibilityLabel={`Remove thickness ${thicknessIndex + 1}`}
        />
      </Tooltip>
    </div>
  );
}

export default function ThicknessChartSection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [validationError, setValidationError] = useState(false);
  const requiredFields = getRequiredFields(SECTION_TYPES.THICKNESS_CHART);
  const thicknesses = useMemo(
    () => section.thicknesses ?? [],
    [section.thicknesses],
  );
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (onValidate === 0) return;
    setValidationError(true);
  }, [onValidate]);

  useEffect(() => {
    if (onSaved === 0) return;
    setValidationError(false);
  }, [onSaved]);

  const getFieldError = (fieldName, label) => {
    if (!validationError || !requiredFields.includes(fieldName)) return "";
    const value = section[fieldName];
    if (value === undefined || value === null || value === "" || value.trim?.() === "") {
      return `${label} is required`;
    }
    return "";
  };

  const updateThickness = (id, value) => {
    onChange({
      thicknesses: thicknesses.map((thickness) =>
        thickness.id === id ? { ...thickness, value } : thickness,
      ),
    });
  };

  const addThickness = () => {
    if (thicknesses.length >= MAX_THICKNESSES) return;
    onChange({ thicknesses: [...thicknesses, createThickness()] });
  };

  const duplicateThickness = (id) => {
    if (thicknesses.length >= MAX_THICKNESSES) return;

    const thicknessIndex = thicknesses.findIndex(
      (thickness) => thickness.id === id,
    );
    if (thicknessIndex === -1) return;

    const duplicate = {
      ...thicknesses[thicknessIndex],
      id: crypto.randomUUID(),
    };

    onChange({
      thicknesses: [
        ...thicknesses.slice(0, thicknessIndex + 1),
        duplicate,
        ...thicknesses.slice(thicknessIndex + 1),
      ],
    });
  };

  const removeThickness = (id) => {
    if (thicknesses.length <= 1) return;
    onChange({
      thicknesses: thicknesses.filter((thickness) => thickness.id !== id),
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = thicknesses.findIndex(
      (thickness) => thickness.id === active.id,
    );
    const newIndex = thicknesses.findIndex(
      (thickness) => thickness.id === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    onChange({ thicknesses: arrayMove(thicknesses, oldIndex, newIndex) });
  };

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Title"
        value={section.title || ""}
        onChange={(title) => onChange({ title })}
        placeholder="Thickness chart"
        autoComplete="off"
        error={getFieldError("title", "Title")}
      />

      <TextField
        label="Subtitle"
        value={section.subtitle || ""}
        onChange={(subtitle) => onChange({ subtitle })}
        placeholder="Choose the right glass thickness"
        autoComplete="off"
      />

      <BlockStack gap="200">
        <Text variant="headingSm" as="h4">
          Thicknesses
        </Text>

        {thicknesses.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={thicknesses.map((thickness) => thickness.id)}
              strategy={verticalListSortingStrategy}
            >
              <BlockStack gap="200">
                {thicknesses.map((thickness, index) => (
                  <SortableThicknessRow
                    key={thickness.id}
                    thickness={thickness}
                    thicknessIndex={index}
                    validationError={validationError}
                    canRemove={thicknesses.length > 1}
                    canDuplicate={thicknesses.length < MAX_THICKNESSES}
                    onChange={updateThickness}
                    onDuplicate={duplicateThickness}
                    onRemove={removeThickness}
                  />
                ))}
              </BlockStack>
            </SortableContext>
          </DndContext>
        )}

        <InlineStack align="start" blockAlign="center" gap="300">
          <Button
            icon={PlusIcon}
            onClick={addThickness}
            disabled={thicknesses.length >= MAX_THICKNESSES}
            size="slim"
          >
            Add thickness
          </Button>
          <Text variant="bodySm" tone="subdued">
            {thicknesses.length} / {MAX_THICKNESSES} values
          </Text>
        </InlineStack>
      </BlockStack>

      <RichTextField
        label="Description"
        value={section.description || ""}
        onChange={(description) => onChange({ description })}
      />
    </BlockStack>
  );
}
