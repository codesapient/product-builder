// app/features/sections/components/ImageSection.jsx

import {
  BlockStack,
  TextField,
  Divider,
  ChoiceList,
} from "@shopify/polaris";
import { IMAGE_LAYOUT } from "../types";
import MediaUploadField from "./media/MediaUploadField";

const LAYOUT_CHOICES = [
  { label: "Image left", value: IMAGE_LAYOUT.LEFT },
  { label: "Image right", value: IMAGE_LAYOUT.RIGHT },
  { label: "Image full width", value: IMAGE_LAYOUT.FULL_WIDTH },
];

export default function ImageSection({ section, onChange }) {
  return (
    <BlockStack gap="400">
      <Divider />

      <ChoiceList
        title="Image layout"
        choices={LAYOUT_CHOICES}
        selected={[section.layout]}
        onChange={([val]) => onChange({ layout: val })}
      />

      <MediaUploadField
        value={section.imageUrl}
        alt={section.imageAlt || "selected image"}
        onChange={(imageUrl) => onChange({ imageUrl })}
      />

      <TextField
        label="Title"
        value={section.title}
        onChange={(val) => onChange({ title: val })}
        placeholder="Section title"
        autoComplete="off"
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