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
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <BlockStack gap="200">
        <Text variant="bodySm" tone="subdued">
          Image source
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
              border: "1px dashed var(--p-color-border)",
              borderRadius: "8px",
              padding: "32px 16px",
            }}
          >
            <BlockStack gap="200" inlineAlign="center">
              <InlineStack gap="300" blockAlign="center">
                <Button onClick={() => setPickerOpen(true)}>Upload new</Button>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  style={{
                    appearance: "none",
                    background: "transparent",
                    border: 0,
                    color: "var(--p-color-text)",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Select existing
                </button>
              </InlineStack>
              <Text variant="bodySm" tone="subdued">
                Accepts images
              </Text>
            </BlockStack>
          </div>
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
