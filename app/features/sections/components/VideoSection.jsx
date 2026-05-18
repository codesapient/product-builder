// app/features/sections/components/VideoSection.jsx

import { BlockStack, TextField, Divider } from '@shopify/polaris'

export default function VideoSection({ section, onChange }) {
  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Video URL"
        value={section.videoUrl}
        onChange={(val) => onChange({ videoUrl: val })}
        placeholder="https://youtube.com/watch?v=..."
        autoComplete="off"
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
  )
}