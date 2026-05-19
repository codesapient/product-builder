import { useEffect, useMemo, useState } from "react";
import {
  BlockStack,
  Button,
  Divider,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon, PlusIcon } from "@shopify/polaris-icons";

import RichTextField from "../../../components/RichTextField";
import { getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";

const MAX_THICKNESSES = 20;

const createThickness = () => ({
  id: crypto.randomUUID(),
  value: "",
});

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

  const removeThickness = (id) => {
    if (thicknesses.length <= 1) return;
    onChange({
      thicknesses: thicknesses.filter((thickness) => thickness.id !== id),
    });
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

        {thicknesses.map((thickness, index) => (
          <div
            key={thickness.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: "12px",
              alignItems: "start",
            }}
          >
            <TextField
              label={`Thickness ${index + 1}`}
              labelHidden
              value={thickness.value || ""}
              onChange={(value) => updateThickness(thickness.id, value)}
              placeholder="1/4"
              autoComplete="off"
              error={
                validationError && !thickness.value?.trim?.()
                  ? "Thickness is required"
                  : ""
              }
            />
            <Button
              variant="plain"
              tone="critical"
              icon={DeleteIcon}
              onClick={() => removeThickness(thickness.id)}
              disabled={thicknesses.length <= 1}
              accessibilityLabel={`Remove thickness ${index + 1}`}
            />
          </div>
        ))}

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
