import { useEffect, useState } from "react";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Divider,
  InlineStack,
  RangeSlider,
  Text,
  TextField,
} from "@shopify/polaris";

import RichTextField from "../../../components/RichTextField";
import { getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";
import { LockIcon } from "@shopify/polaris-icons";

const ALIGNMENT_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const MIN_SPACING = 0;
const MAX_SPACING = 120;
const MIN_RADIUS = 0;
const MAX_RADIUS = 80;

const clampNumber = (value, min, max, fallback) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

export default function RichTextSection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [validationError, setValidationError] = useState(false);
  const requiredFields = getRequiredFields(SECTION_TYPES.RICH_TEXT);
  const backgroundColor = section.backgroundColor || "#ffffff";
  const borderRadius = clampNumber(section.borderRadius, MIN_RADIUS, MAX_RADIUS, 8);
  const paddingTop = clampNumber(section.paddingTop, MIN_SPACING, MAX_SPACING, 24);
  const paddingRight = clampNumber(section.paddingRight, MIN_SPACING, MAX_SPACING, 24);
  const paddingBottom = clampNumber(section.paddingBottom, MIN_SPACING, MAX_SPACING, 24);
  const paddingLeft = clampNumber(section.paddingLeft, MIN_SPACING, MAX_SPACING, 24);
  const syncedPadding =
    paddingTop === paddingRight &&
    paddingTop === paddingBottom &&
    paddingTop === paddingLeft;
  const [paddingLocked, setPaddingLocked] = useState(syncedPadding);

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

  const handlePaddingLockToggle = () => {
    if (paddingLocked) {
      setPaddingLocked(false);
      return;
    }

    setPaddingLocked(true);
    onChange({
      paddingTop,
      paddingRight: paddingTop,
      paddingBottom: paddingTop,
      paddingLeft: paddingTop,
    });
  };

  const handlePaddingChange = (fieldName, value) => {
    const padding = clampNumber(value, MIN_SPACING, MAX_SPACING, MIN_SPACING);

    if (paddingLocked) {
      onChange({
        paddingTop: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingLeft: padding,
      });
      return;
    }

    onChange({ [fieldName]: padding });
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

      <RangeSlider
        label="Border radius"
        min={MIN_RADIUS}
        max={MAX_RADIUS}
        step={1}
        value={borderRadius}
        output
        suffix={<Text as="span" variant="bodySm">{borderRadius}px</Text>}
        onChange={(borderRadius) => onChange({ borderRadius })}
      />

      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="bodyMd" as="p">
            Padding
          </Text>
          <Button
            variant={paddingLocked ? "primary" : "secondary"}
            icon={LockIcon}
            pressed={paddingLocked}
            onClick={handlePaddingLockToggle}
            accessibilityLabel={
              paddingLocked
                ? "Unlock padding sides"
                : "Lock padding sides together"
            }
          />
        </InlineStack>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <TextField
            label="Top"
            type="number"
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={1}
            value={String(paddingTop)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingTop", value)}
          />
          <TextField
            label="Right"
            type="number"
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={1}
            value={String(paddingRight)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingRight", value)}
          />
          <TextField
            label="Bottom"
            type="number"
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={1}
            value={String(paddingBottom)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingBottom", value)}
          />
          <TextField
            label="Left"
            type="number"
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={1}
            value={String(paddingLeft)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingLeft", value)}
          />
        </div>
      </BlockStack>

      <div
        style={{
          backgroundColor,
          paddingTop,
          paddingRight,
          paddingBottom,
          paddingLeft,
          textAlign: section.textAlignment || "center",
          border: "1px solid var(--p-color-border)",
          borderRadius,
        }}
      >
        <Text variant="headingMd" as="h3">
          {section.title || "Rich text title"}
        </Text>
      </div>
    </BlockStack>
  );
}
