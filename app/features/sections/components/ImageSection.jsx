import { useState, useEffect } from "react";
import {
  BlockStack,
  TextField,
  Divider,
  ButtonGroup,
  Button,
  Text,
} from "@shopify/polaris";
import { IMAGE_LAYOUT } from "../types";
import { SECTION_TYPES } from "../types";
import { getRequiredFields } from "../schema";
import RichTextField from "../../../components/RichTextField";
import MediaUploadField from "./media/MediaUploadField";

const LAYOUT_CHOICES = [
  { label: "Left", value: IMAGE_LAYOUT.LEFT },
  { label: "Right", value: IMAGE_LAYOUT.RIGHT }
];

export default function ImageSection({ section, onChange, onSaved, onValidate }) {
  const [validationError, setValidationError] = useState(false);

  // Show validation errors when triggered
  useEffect(() => {
    setValidationError(true);
  }, [onValidate]);

  // Reset validation error when saved
  useEffect(() => {
    setValidationError(false);
  }, [onSaved]);

  const requiredFields = getRequiredFields(SECTION_TYPES.IMAGE);

  const getFieldError = (fieldName) => {
    if (!validationError || !requiredFields.includes(fieldName)) return "";
    const value = section[fieldName];
    if (value === undefined || value === null || value === "" || value.trim?.() === "") {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    return "";
  };

  return (
    <BlockStack gap="400">
      <Divider />

      <BlockStack gap="200">
        <Text variant="bodyMd" as="p">Image alignment</Text>
        <ButtonGroup variant="segmented">
          {LAYOUT_CHOICES.map(({ label, value }) => (
            <Button
              key={value}
              pressed={section.layout === value}
              onClick={() => onChange({ layout: value })}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </BlockStack>

      <MediaUploadField
        value={section.imageUrl}
        alt={section.imageAlt || "selected image"}
        onChange={(imageUrl) => onChange({ imageUrl })}
        error={getFieldError("imageUrl")}
      />

      <TextField
        label="Title"
        value={section.title}
        onChange={(val) => onChange({ title: val })}
        placeholder="Section title"
        autoComplete="off"
        error={getFieldError("title")}
      />

      <RichTextField
        label="Description"
        value={section.description}
        onChange={(val) => onChange({ description: val })}
      />
    </BlockStack>
  );
}
