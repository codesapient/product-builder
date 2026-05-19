import { useEffect, useState } from "react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Divider,
  RangeSlider,
  Text,
  TextField,
} from "@shopify/polaris";

import { getRequiredFields } from "../schema";
import { SECTION_TYPES } from "../types";
import MediaUploadField from "./media/MediaUploadField";

const ALIGNMENT_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const MIN_RADIUS = 0;
const MAX_RADIUS = 80;

const clampRadius = (value) =>
  Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, Number(value) || MIN_RADIUS));

export default function BannerWithTextSection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [validationError, setValidationError] = useState(false);
  const requiredFields = getRequiredFields(SECTION_TYPES.BANNER_WITH_TEXT);
  const borderRadius = clampRadius(section.borderRadius);

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

      <MediaUploadField
        value={section.backgroundImageUrl}
        alt={section.backgroundImageAlt || "banner background image"}
        onChange={(backgroundImageUrl) => onChange({ backgroundImageUrl })}
        error={getFieldError("backgroundImageUrl", "Background image")}
      />

      <TextField
        label="Heading"
        value={section.heading || ""}
        onChange={(heading) => onChange({ heading })}
        placeholder="Banner heading"
        autoComplete="off"
        error={getFieldError("heading", "Heading")}
      />

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

    </BlockStack>
  );
}
