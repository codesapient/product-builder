import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  DropZone,
  InlineStack,
  Modal,
  Popover,
  Spinner,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import {
  ChevronDownIcon,
  LayoutColumns2Icon,
  SortAscendingIcon,
} from "@shopify/polaris-icons";

import { fetchImageFiles, uploadImage } from "../../api/mediaUploads";

function getFileKind(file) {
  if (!file?.type) return "IMAGE";
  return file.type.split("/")[1]?.toUpperCase() || "IMAGE";
}

function getDisplayName(name = "") {
  if (!name) return "Uploaded image";
  return name.length > 18 ? `${name.slice(0, 15)}...` : name;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  initialUrl,
  title = "Select file",
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [existingAssets, setExistingAssets] = useState([]);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const uploadedAssetsRef = useRef([]);
  const [uploading, setUploading] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [urlPopoverActive, setUrlPopoverActive] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const initialAsset = useMemo(() => {
    if (!initialUrl) return null;

    return {
      id: "current-image",
      name: "Current image",
      kind: "IMAGE",
      url: initialUrl,
      source: "existing",
    };
  }, [initialUrl]);

  const assets = useMemo(() => {
    const seen = new Set();

    return [initialAsset, ...uploadedAssets, ...existingAssets]
      .filter(Boolean)
      .filter((asset) => {
        const key = asset.url || asset.previewUrl || asset.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [existingAssets, initialAsset, uploadedAssets]);

  const filteredAssets = assets.filter((asset) =>
    asset.source !== "existing"
      ? asset.name.toLowerCase().includes(searchValue.toLowerCase())
      : true,
  );

  useEffect(() => {
    uploadedAssetsRef.current = uploadedAssets;
  }, [uploadedAssets]);

  useEffect(() => {
    if (!open) return;

    // Reset on new search or modal open
    setExistingAssets([]);
    setNextCursor(null);
    setHasNextPage(false);

    let active = true;
    const timer = setTimeout(() => {
      setLoadingFiles(true);
      setError(null);

      fetchImageFiles(searchValue.trim(), null)
        .then(({ files, hasNextPage: more, nextCursor: cursor }) => {
          if (!active) return;
          setExistingAssets(files);
          setHasNextPage(more);
          setNextCursor(cursor);
        })
        .catch((err) => { if (active) setError(err.message); })
        .finally(() => { if (active) setLoadingFiles(false); });
    }, searchValue.trim() ? 400 : 0);

    return () => { active = false; clearTimeout(timer); };
  }, [open, searchValue]);

  useEffect(() => {
    return () => {
      uploadedAssetsRef.current.forEach((asset) => {
        if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
      });
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loadingMore || loadingFiles) return;

    setLoadingMore(true);
    fetchImageFiles(searchValue.trim(), nextCursor)
      .then(({ files, hasNextPage: more, nextCursor: cursor }) => {
        setExistingAssets((prev) => [...prev, ...files]);
        setHasNextPage(more);
        setNextCursor(cursor);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMore(false));
  }, [hasNextPage, loadingMore, loadingFiles, searchValue, nextCursor]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleDrop = useCallback((_dropped, accepted) => {
    setFileDialogOpen(false);

    const imageFiles = accepted.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!imageFiles.length) {
      setError("Add an image file to continue.");
      return;
    }

    const nextAssets = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      kind: getFileKind(file),
      previewUrl: URL.createObjectURL(file),
      file,
      source: "local",
    }));

    setUploadedAssets((current) => [...nextAssets, ...current]);
    setSelectedAsset(nextAssets[0]);
    setError(null);
  }, []);

  const handleAddUrl = () => {
    const url = mediaUrl.trim();
    if (!url) return;

    const asset = {
      id: `url-${crypto.randomUUID()}`,
      name: getDisplayName(url.split("/").pop() || "Image URL"),
      kind: "URL",
      url,
      source: "existing",
    };

    setUploadedAssets((current) => [asset, ...current]);
    setSelectedAsset(asset);
    setMediaUrl("");
    setUrlPopoverActive(false);
  };

  const handleDone = async () => {
    if (!selectedAsset) return;

    if (selectedAsset.source === "existing") {
      onSelect(selectedAsset.url);
      onClose();
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(selectedAsset.file);
      onSelect(url);
      onClose();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      large
      primaryAction={{
        content: "Done",
        onAction: handleDone,
        disabled: !selectedAsset || uploading,
        loading: uploading,
      }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
          )}

          <InlineStack align="space-between" blockAlign="center" gap="400">
            <Box minWidth="320px" width="55%">
              <TextField
                label="Search files"
                labelHidden
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search files"
                autoComplete="off"
              />
            </Box>

            <InlineStack gap="200">
              <Button icon={SortAscendingIcon}>Sort</Button>
              <Button
                icon={LayoutColumns2Icon}
                accessibilityLabel="Grid view"
              />
            </InlineStack>
          </InlineStack>

          <DropZone
            accept="image/*"
            type="image"
            openFileDialog={fileDialogOpen}
            onClick={() => {}}
            onFileDialogClose={() => setFileDialogOpen(false)}
            onDrop={handleDrop}
          >
            <div
              style={{
                border: "1px dashed var(--p-color-border)",
                borderRadius: "8px",
                padding: "32px 16px",
              }}
            >
              <BlockStack gap="200" inlineAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <div onClick={(event) => event.stopPropagation()}>
                    <ButtonGroup variant="segmented">
                      <Button onClick={() => setFileDialogOpen(true)}>
                        Add media
                      </Button>
                      <Popover
                        active={urlPopoverActive}
                        preferredAlignment="right"
                        activator={
                          <Button
                            icon={ChevronDownIcon}
                            accessibilityLabel="Add media options"
                            onClick={() => setUrlPopoverActive((open) => !open)}
                          />
                        }
                        autofocusTarget="first-node"
                        onClose={() => setUrlPopoverActive(false)}
                      >
                        <Box padding="400" minWidth="320px">
                          <BlockStack gap="300">
                            <Text variant="headingSm" as="h3">
                              Add media from URL
                            </Text>
                            <TextField
                              label="Image URL"
                              value={mediaUrl}
                              onChange={setMediaUrl}
                              placeholder="https://"
                              autoComplete="off"
                            />
                            <Button
                              onClick={handleAddUrl}
                              disabled={!mediaUrl.trim()}
                            >
                              Add file
                            </Button>
                          </BlockStack>
                        </Box>
                      </Popover>
                    </ButtonGroup>
                  </div>
                </InlineStack>
                <Text variant="bodySm" tone="subdued">
                  Drag and drop images
                </Text>
              </BlockStack>
            </div>
          </DropZone>

          <MediaGrid
            assets={filteredAssets}
            selectedId={selectedAsset?.id}
            onSelect={setSelectedAsset}
          />

          {hasNextPage && <div ref={sentinelRef} style={{ height: "1px" }} />}

          {(loadingFiles || loadingMore) && (
            <InlineStack gap="200" blockAlign="center">
              <Spinner size="small" />
              <Text variant="bodySm" tone="subdued">
                {loadingMore ? "Loading more..." : "Loading Shopify files..."}
              </Text>
            </InlineStack>
          )}

          {uploading && (
            <>
              <Divider />
              <InlineStack gap="200" blockAlign="center">
                <Spinner size="small" />
                <Text variant="bodySm" tone="subdued">
                  Uploading image to Shopify...
                </Text>
              </InlineStack>
            </>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function MediaGrid({ assets, selectedId, onSelect }) {
  if (!assets.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "28px 32px",
      }}
    >
      {assets.map((asset) => (
        <MediaTile
          key={asset.id}
          asset={asset}
          selected={asset.id === selectedId}
          onSelect={() => onSelect(asset)}
        />
      ))}
    </div>
  );
}

function MediaTile({ asset, selected, onSelect }) {
  const source = asset.previewUrl || asset.thumbnailUrl || asset.url;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        appearance: "none",
        background: "transparent",
        border: 0,
        color: "inherit",
        cursor: "pointer",
        padding: 0,
        textAlign: "center",
      }}
    >
      <BlockStack gap="200" inlineAlign="center">
        <div style={{ position: "relative" }}>
          <Thumbnail source={source} alt={asset.name} size="large" />
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "6px",
              borderRadius: "4px",
            }}
          >
            <Checkbox
              label={`Select ${asset.name}`}
              labelHidden
              checked={selected}
              onChange={onSelect}
            />
          </div>
        </div>
        <BlockStack gap="0">
          <Text variant="bodySm" as="span" truncate>
            {getDisplayName(asset.name)}
          </Text>
          <Text variant="bodySm" as="span" tone="subdued">
            {asset.kind}
          </Text>
        </BlockStack>
      </BlockStack>
    </button>
  );
}
