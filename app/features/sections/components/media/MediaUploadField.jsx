import { useState } from "react";
import {
  BlockStack,
  Button,
  InlineStack,
  Text,
  Thumbnail,
} from "@shopify/polaris";

import MediaPickerModal from "./MediaPickerModal";

export default function MediaUploadField({
  value,
  alt = "Selected image",
  onChange,
  onRemove,
  error = "",
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const borderColor = error ? "var(--p-color-border-critical)" : "var(--p-color-border)";

  return (
    <>
      <BlockStack gap="200">
        <Text variant="bodySm" tone="subdued">
          Image
        </Text>

        {value ? (
          <InlineStack gap="300" blockAlign="center">
            <Thumbnail source={value} alt={alt} size="large" />
            <Button
              variant="plain"
              tone="critical"
              onClick={onRemove || (() => onChange(""))}
            >
              Remove
            </Button>
          </InlineStack>
        ) : (
          <div
            style={{
              border: `2px dashed ${borderColor}`,
              borderRadius: "8px",
              padding: "32px 16px",
            }}
          >
            <BlockStack gap="200" inlineAlign="center">
              <Button onClick={() => setPickerOpen(true)}>Upload or select image</Button>
              <Text variant="bodySm" tone="subdued">
                Accepts images
              </Text>
            </BlockStack>
          </div>
        )}
        {error && (
          <Text variant="bodySm" tone="critical">
            {error}
          </Text>
        )}
      </BlockStack>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        initialUrl={value}
      />
    </>
  );
}
