import { useState } from "react";
import { BlockStack, Button, Divider, InlineStack, Text, TextField } from "@shopify/polaris";
import { LockIcon } from "@shopify/polaris-icons";

const MIN_PADDING = 0;
const MAX_PADDING = 150;
const MIN_WIDTH = 0;
const MAX_WIDTH = 5;

const clampNumber = (value, min, max, fallback) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

const clampPadding = (value) =>
  clampNumber(value, MIN_PADDING, MAX_PADDING, MIN_PADDING);

const clampWidth = (value) =>
  clampNumber(value, MIN_WIDTH, MAX_WIDTH, MIN_WIDTH);

export default function DividerSection({ section, onChange }) {
  const width = clampWidth(section.width ?? 1);
  const paddingTop = clampPadding(section.paddingTop ?? 40);
  const paddingBottom = clampPadding(section.paddingBottom ?? 40);
  const [paddingLocked, setPaddingLocked] = useState(
    () => paddingTop === paddingBottom,
  );

  const handlePaddingLockToggle = () => {
    if (paddingLocked) {
      setPaddingLocked(false);
      return;
    }

    setPaddingLocked(true);
    onChange({
      paddingTop,
      paddingBottom: paddingTop,
    });
  };

  const handlePaddingChange = (fieldName, value) => {
    const padding = clampPadding(value);

    if (paddingLocked) {
      onChange({
        paddingTop: padding,
        paddingBottom: padding,
      });
      return;
    }

    onChange({ [fieldName]: padding });
  };

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Line weight"
        type="number"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        step={1}
        value={String(width)}
        suffix="px"
        autoComplete="off"
        onChange={(value) => onChange({ width: clampWidth(value) })}
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
                ? "Unlock spacer padding"
                : "Lock spacer padding together"
            }
          />
        </InlineStack>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <TextField
            label="Top"
            type="number"
            min={MIN_PADDING}
            max={MAX_PADDING}
            step={1}
            value={String(paddingTop)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingTop", value)}
          />

          <TextField
            label="Bottom"
            type="number"
            min={MIN_PADDING}
            max={MAX_PADDING}
            step={1}
            value={String(paddingBottom)}
            suffix="px"
            autoComplete="off"
            onChange={(value) => handlePaddingChange("paddingBottom", value)}
          />
        </div>
      </BlockStack>

      <div
        style={{
          paddingTop,
          paddingBottom,
        }}
      >
        <hr
          style={{
            border: 0,
            borderTop: `${width}px solid var(--p-color-border)`,
            margin: 0,
          }}
        />
      </div>
    </BlockStack>
  );
}
