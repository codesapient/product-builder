import { BlockStack, Divider, TextField } from "@shopify/polaris";

const MIN_HEIGHT = 0;
const MAX_HEIGHT = 300;

const clampHeight = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return MIN_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, numberValue));
};

export default function SpacerSection({ section, onChange }) {
  const height = clampHeight(section.height ?? 40);

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Height"
        type="number"
        min={MIN_HEIGHT}
        max={MAX_HEIGHT}
        step={1}
        value={String(height)}
        suffix="px"
        autoComplete="off"
        onChange={(value) => onChange({ height: clampHeight(value) })}
      />

      <div
        style={{
          height,
          border: "1px dashed var(--p-color-border)",
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 8px, var(--p-color-bg-surface-secondary) 8px, var(--p-color-bg-surface-secondary) 16px)",
        }}
      />
    </BlockStack>
  );
}
