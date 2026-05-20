import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  Divider,
  InlineStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";

import SortableAccordionHeader from "./SortableAccordionHeader";
import { getRequiredFields, validateGalleryVideo } from "../schema";
import { SECTION_TYPES } from "../types";

const MAX_PLAYLIST_VIDEOS = 24;

const createGalleryVideo = () => ({
  id: crypto.randomUUID(),
  title: "",
  url: "",
  author: "",
});

function GalleryVideoFields({
  video,
  validationError,
  onChange,
  titleLabel = "Video title",
}) {
  return (
    <BlockStack gap="300">
      <TextField
        label={titleLabel}
        value={video.title || ""}
        onChange={(title) => onChange({ title })}
        placeholder="Glass Creations Hub - About Us"
        autoComplete="off"
        error={
          validationError && !video.title?.trim?.()
            ? "Video title is required"
            : ""
        }
      />
      <TextField
        label="Video URL"
        value={video.url || ""}
        onChange={(url) => onChange({ url })}
        placeholder="https://youtube.com/watch?v=..."
        autoComplete="off"
        error={
          validationError && !video.url?.trim?.()
            ? "Video URL is required"
            : ""
        }
      />
      <TextField
        label="Author"
        value={video.author || ""}
        onChange={(author) => onChange({ author })}
        placeholder="Glass Creations Hub"
        autoComplete="off"
      />
    </BlockStack>
  );
}

function PlaylistVideoEditor({
  video,
  videoIndex,
  isOpen,
  onToggle,
  onChange,
  onRemove,
  onDuplicate,
  validationError,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayTitle = video.title?.trim()
    ? `Video ${videoIndex + 1} - ${video.title}`
    : `Video ${videoIndex + 1}`;

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <BlockStack gap="0">
          <SortableAccordionHeader
            title={displayTitle}
            expanded={isOpen}
            onToggle={onToggle}
            onDuplicate={() => onDuplicate(video.id)}
            onDelete={() => onRemove(video.id)}
            dragAttributes={attributes}
            dragListeners={listeners}
            controlsId={`playlist-video-${video.id}`}
            titleAs="h4"
            titleTone="subdued"
            toggleAccessibilityLabel={`Toggle ${displayTitle}`}
            duplicateAccessibilityLabel={`Duplicate ${displayTitle}`}
            deleteAccessibilityLabel={`Remove ${displayTitle}`}
          />

          <Collapsible open={isOpen} id={`playlist-video-${video.id}`}>
            <Box paddingBlockStart="300">
              <Divider />
              <Box paddingBlockStart="300">
                <GalleryVideoFields
                  video={video}
                  validationError={validationError}
                  onChange={(changes) => onChange(video.id, changes)}
                />
              </Box>
            </Box>
          </Collapsible>
        </BlockStack>
      </Card>
    </div>
  );
}

export default function VideoGallerySection({
  section,
  onChange,
  onSaved,
  onValidate,
}) {
  const [titleError, setTitleError] = useState("");
  const [openVideoId, setOpenVideoId] = useState(
    () => section.videos?.[0]?.id ?? null,
  );
  const [validationErrorVideoIds, setValidationErrorVideoIds] = useState(
    new Set(),
  );
  const videos = useMemo(() => section.videos ?? [], [section.videos]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (onValidate === 0) return;

    const requiredFields = getRequiredFields(SECTION_TYPES.VIDEO_GALLERY);
    setTitleError(
      requiredFields.includes("title") && !section.title?.trim()
        ? "Title is required"
        : "",
    );

    const errorVideoIds = new Set();
    videos.forEach((video) => {
      if (validateGalleryVideo(video).length > 0) {
        errorVideoIds.add(video.id);
      }
    });

    setValidationErrorVideoIds(errorVideoIds);
    if (errorVideoIds.size > 0) {
      const firstErrorVideo = videos.find((video) => errorVideoIds.has(video.id));
      if (firstErrorVideo) setOpenVideoId(firstErrorVideo.id);
    }
  }, [onValidate, section.title, videos]);

  useEffect(() => {
    if (onSaved === 0) return;

    setTitleError("");
    setOpenVideoId(null);
    setValidationErrorVideoIds(new Set());
  }, [onSaved]);

  const handleAddVideo = () => {
    if (videos.length >= MAX_PLAYLIST_VIDEOS) return;

    const invalidVideoIds = new Set();
    videos.forEach((video) => {
      if (validateGalleryVideo(video).length > 0) {
        invalidVideoIds.add(video.id);
      }
    });

    if (invalidVideoIds.size > 0) {
      setValidationErrorVideoIds(invalidVideoIds);
      const firstInvalidVideo = videos.find((video) =>
        invalidVideoIds.has(video.id),
      );
      if (firstInvalidVideo) setOpenVideoId(firstInvalidVideo.id);
      return;
    }

    const newVideo = createGalleryVideo();
    onChange({ videos: [...videos, newVideo] });
    setOpenVideoId(newVideo.id);
  };

  const handleRemoveVideo = (id) => {
    const remaining = videos.filter((video) => video.id !== id);
    onChange({ videos: remaining });
    setValidationErrorVideoIds((prevIds) => {
      const nextIds = new Set(prevIds);
      nextIds.delete(id);
      return nextIds;
    });
    if (openVideoId === id) {
      setOpenVideoId(remaining[remaining.length - 1]?.id ?? null);
    }
  };

  const handleDuplicateVideo = (id) => {
    if (videos.length >= MAX_PLAYLIST_VIDEOS) return;

    const videoIndex = videos.findIndex((video) => video.id === id);
    if (videoIndex === -1) return;

    const duplicate = {
      ...videos[videoIndex],
      id: crypto.randomUUID(),
    };

    onChange({
      videos: [
        ...videos.slice(0, videoIndex + 1),
        duplicate,
        ...videos.slice(videoIndex + 1),
      ],
    });
    setOpenVideoId(duplicate.id);
  };

  const handleVideoChange = (id, changes) => {
    const updatedVideo = {
      ...videos.find((video) => video.id === id),
      ...changes,
    };

    if (
      validationErrorVideoIds.has(id) &&
      validateGalleryVideo(updatedVideo).length === 0
    ) {
      setValidationErrorVideoIds((prevIds) => {
        const nextIds = new Set(prevIds);
        nextIds.delete(id);
        return nextIds;
      });
    }

    onChange({
      videos: videos.map((video) =>
        video.id === id ? { ...video, ...changes } : video,
      ),
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((video) => video.id === active.id);
    const newIndex = videos.findIndex((video) => video.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange({ videos: arrayMove(videos, oldIndex, newIndex) });
  };

  return (
    <BlockStack gap="400">
      <Divider />

      <TextField
        label="Gallery title"
        value={section.title || ""}
        onChange={(title) => {
          onChange({ title });
          if (title.trim()) setTitleError("");
        }}
        placeholder="Product Videos"
        autoComplete="off"
        error={titleError}
      />

      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h4">
            Playlist videos
          </Text>
          <Text variant="bodySm" tone="subdued">
            {videos.length} / {MAX_PLAYLIST_VIDEOS} videos
          </Text>
        </InlineStack>

        {videos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={videos.map((video) => video.id)}
              strategy={verticalListSortingStrategy}
            >
              <BlockStack gap="200">
                {videos.map((video, index) => (
                  <PlaylistVideoEditor
                    key={video.id}
                    video={video}
                    videoIndex={index}
                    isOpen={openVideoId === video.id}
                    onToggle={() =>
                      setOpenVideoId((prev) =>
                        prev === video.id ? null : video.id,
                      )
                    }
                    onChange={handleVideoChange}
                    onRemove={handleRemoveVideo}
                    onDuplicate={handleDuplicateVideo}
                    validationError={validationErrorVideoIds.has(video.id)}
                  />
                ))}
              </BlockStack>
            </SortableContext>
          </DndContext>
        )}

        <InlineStack align="start" blockAlign="center" gap="300">
          <Button
            icon={PlusIcon}
            onClick={handleAddVideo}
            disabled={videos.length >= MAX_PLAYLIST_VIDEOS}
            size="slim"
          >
            Add new video
          </Button>
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
}
