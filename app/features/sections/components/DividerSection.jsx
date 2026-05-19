import { BlockStack, Divider, RangeSlider, Text } from "@shopify/polaris";

const MIN_PADDING = 10;
const MAX_PADDING = 150;
const MIN_WIDTH = 1;
const MAX_WIDTH = 5;

const clampPadding = (value) =>
  Math.min(MAX_PADDING, Math.max(MIN_PADDING, Number(value) || MIN_PADDING));

const clampWidth = (value) =>
  Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Number(value) || MIN_WIDTH));

export default function DividerSection({ section, onChange }) {
  const width = clampWidth(section.width ?? 1);
  const paddingTop = clampPadding(section.paddingTop ?? 40);
  const paddingBottom = clampPadding(section.paddingBottom ?? 40);

  return (
    <BlockStack gap="400">
      <Divider />

      <RangeSlider
        label="Line width"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        step={1}
        value={width}
        output
        suffix={<Text as="span" variant="bodySm">{width}px</Text>}
        onChange={(width) => onChange({ width })}
      />

      <RangeSlider
        label="Padding top"
        min={MIN_PADDING}
        max={MAX_PADDING}
        step={1}
        value={paddingTop}
        output
        suffix={<Text as="span" variant="bodySm">{paddingTop}px</Text>}
        onChange={(paddingTop) => onChange({ paddingTop })}
      />

      <RangeSlider
        label="Padding bottom"
        min={MIN_PADDING}
        max={MAX_PADDING}
        step={1}
        value={paddingBottom}
        output
        suffix={<Text as="span" variant="bodySm">{paddingBottom}px</Text>}
        onChange={(paddingBottom) => onChange({ paddingBottom })}
      />

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
