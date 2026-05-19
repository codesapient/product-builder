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

const ALIGNMENT_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const MIN_SPACING = 0;
const MAX_SPACING = 120;
const MIN_RADIUS = 0;
const MAX_RADIUS = 80;

const clampNumber = (value, min, max, fallback) =>
  Math.min(max, Math.max(min, Number(value) || fallback));

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
  const allPadding = syncedPadding ? paddingTop : 24;

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
        <Text variant="bodyMd" as="p">
          Padding
        </Text>
        <RangeSlider
          label="All sides"
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={1}
          value={allPadding}
          output
          suffix={
            <Text as="span" variant="bodySm">
              {syncedPadding ? `${allPadding}px` : "Mixed"}
            </Text>
          }
          onChange={(padding) =>
            onChange({
              paddingTop: padding,
              paddingRight: padding,
              paddingBottom: padding,
              paddingLeft: padding,
            })
          }
        />
        <RangeSlider
          label="Top"
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={1}
          value={paddingTop}
          output
          suffix={<Text as="span" variant="bodySm">{paddingTop}px</Text>}
          onChange={(paddingTop) => onChange({ paddingTop })}
        />
        <RangeSlider
          label="Right"
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={1}
          value={paddingRight}
          output
          suffix={<Text as="span" variant="bodySm">{paddingRight}px</Text>}
          onChange={(paddingRight) => onChange({ paddingRight })}
        />
        <RangeSlider
          label="Bottom"
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={1}
          value={paddingBottom}
          output
          suffix={<Text as="span" variant="bodySm">{paddingBottom}px</Text>}
          onChange={(paddingBottom) => onChange({ paddingBottom })}
        />
        <RangeSlider
          label="Left"
          min={MIN_SPACING}
          max={MAX_SPACING}
          step={1}
          value={paddingLeft}
          output
          suffix={<Text as="span" variant="bodySm">{paddingLeft}px</Text>}
          onChange={(paddingLeft) => onChange({ paddingLeft })}
        />
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
