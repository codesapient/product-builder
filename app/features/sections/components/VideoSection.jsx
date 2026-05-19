// app/features/sections/components/VideoSection.jsx

import { useState, useEffect } from "react";
import { BlockStack, TextField, Divider } from "@shopify/polaris";
import { SECTION_TYPES } from "../types";
import { getRequiredFields } from "../schema";

export default function VideoSection({ section, onChange, onSaved, onValidate }) {
  const [validationError, setValidationError] = useState(false);

  // Show validation errors when triggered
  useEffect(() => {
    setValidationError(true);
  }, [onValidate]);

  // Reset validation error when saved
  useEffect(() => {
    setValidationError(false);
  }, [onSaved]);

  const requiredFields = getRequiredFields(SECTION_TYPES.VIDEO);

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

      <TextField
        label="Video URL"
        value={section.videoUrl}
        onChange={(val) => onChange({ videoUrl: val })}
        placeholder="https://youtube.com/watch?v=..."
        autoComplete="off"
        error={getFieldError("videoUrl")}
      />

      <TextField
        label="Title"
        value={section.title}
        onChange={(val) => onChange({ title: val })}
        placeholder="Section title"
        autoComplete="off"
        error={getFieldError("title")}
      />

      <TextField
        label="Description"
        value={section.description}
        onChange={(val) => onChange({ description: val })}
        placeholder="Section description"
        multiline={3}
        autoComplete="off"
      />
    </BlockStack>
  );
}
