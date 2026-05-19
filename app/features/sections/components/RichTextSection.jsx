import { useEffect, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Divider,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";

import RichTextField from "../../../components/RichTextField";
import { getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";

const ALIGNMENT_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

export default function RichTextSection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [validationError, setValidationError] = useState(false);
  const requiredFields = getRequiredFields(SECTION_TYPES.RICH_TEXT);
  const backgroundColor = section.backgroundColor || "#ffffff";

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

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Title"
        value={section.title || ""}
        onChange={(title) => onChange({ title })}
        placeholder="Section title"
        autoComplete="off"
        error={getFieldError("title", "Title")}
      />

      <RichTextField
        label="Description"
        value={section.description || ""}
        onChange={(description) => onChange({ description })}
      />

      <BlockStack gap="200">
        <Text variant="bodyMd" as="p">
          Background color
        </Text>
        <InlineStack gap="300" blockAlign="center" wrap={false}>
          <input
            type="color"
            value={backgroundColor}
            onChange={(event) => onChange({ backgroundColor: event.target.value })}
            style={{
              width: "44px",
              height: "36px",
              border: "1px solid var(--p-color-border)",
              borderRadius: "6px",
              padding: "2px",
              background: "transparent",
              cursor: "pointer",
            }}
          />
          <Box width="180px">
            <TextField
              label="Background color value"
              labelHidden
              value={backgroundColor}
              onChange={(backgroundColor) => onChange({ backgroundColor })}
              placeholder="#ffffff"
              autoComplete="off"
            />
          </Box>
        </InlineStack>
      </BlockStack>

      <BlockStack gap="200">
        <Text variant="bodyMd" as="p">
          Text alignment
        </Text>
        <ButtonGroup variant="segmented">
          {ALIGNMENT_OPTIONS.map(({ label, value }) => (
            <Button
              key={value}
              pressed={(section.textAlignment || "center") === value}
              onClick={() => onChange({ textAlignment: value })}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </BlockStack>

      <div
        style={{
          backgroundColor,
          padding: "24px",
          textAlign: section.textAlignment || "center",
          border: "1px solid var(--p-color-border)",
          borderRadius: "8px",
        }}
      >
        <Text variant="headingMd" as="h3">
          {section.title || "Rich text title"}
        </Text>
      </div>
    </BlockStack>
  );
}
