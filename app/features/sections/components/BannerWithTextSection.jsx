import { useEffect, useState } from "react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Divider,
  InlineGrid,
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
  const imageBorderRadius = clampRadius(section.imageBorderRadius);

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

      <BlockStack gap="200">
        <TextField
          label="Heading"
          value={section.heading || ""}
          onChange={(heading) => onChange({ heading })}
          placeholder="Banner heading"
          autoComplete="off"
          error={getFieldError("heading", "Heading")}
        />



      </BlockStack>

      <MediaUploadField
        value={section.imageUrl}
        alt="banner image"
        onChange={(imageUrl) => onChange({ imageUrl })}
        error={getFieldError("imageUrl", "Background image")}
      />

      <InlineGrid columns={2} gap="400" alignItems="center">
        <TextField
          label="Image width"
          type="number"
          value={section.imageWidth?.toString() || ""}
          onChange={(value) =>
            onChange({
              imageWidth: Number(value) || 100,
            })
          }
          placeholder="400"
          autoComplete="off"
          suffix="%"
        />
        <RangeSlider
          label="Image Border radius"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={1}
          value={imageBorderRadius}
          output
          suffix={<Text as="span" variant="bodySm">{imageBorderRadius}px</Text>}
          onChange={(imageBorderRadius) => onChange({ imageBorderRadius })}
        />
      </InlineGrid>

      <BlockStack gap="200">
        <Text variant="bodyMd" as="p">
          Alignment
        </Text>
        <ButtonGroup variant="segmented">
          {ALIGNMENT_OPTIONS.map(({ label, value }) => (
            <Button
              key={value}
              pressed={(section.alignment || "center") === value}
              onClick={() => onChange({ alignment: value })}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </BlockStack>

    </BlockStack>
  );
}
