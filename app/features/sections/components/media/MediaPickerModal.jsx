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
    asset.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  useEffect(() => {
    uploadedAssetsRef.current = uploadedAssets;
  }, [uploadedAssets]);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoadingFiles(true);
    setError(null);

    fetchImageFiles()
      .then((files) => {
        if (active) setExistingAssets(files);
      })
      .catch((filesError) => {
        if (active) setError(filesError.message);
      })
      .finally(() => {
        if (active) setLoadingFiles(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      uploadedAssetsRef.current.forEach((asset) => {
        if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
      });
    };
  }, []);

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

          {loadingFiles && (
            <InlineStack gap="200" blockAlign="center">
              <Spinner size="small" />
              <Text variant="bodySm" tone="subdued">
                Loading Shopify files...
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
  const source = asset.previewUrl || asset.url;

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
              background: "white",
              borderRadius: "4px",
              boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.18)",
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
