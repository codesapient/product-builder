export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || "Upload failed");
  }

  return payload.url;
}

export async function fetchImageFiles(query = "", cursor = null) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  if (cursor) params.set("after", cursor);

  const res = await fetch(`/api/files?${params.toString()}`);
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || "Unable to load files");
  }

  // Now returns object instead of array
  return {
    files: payload.files ?? [],
    hasNextPage: payload.hasNextPage ?? false,
    nextCursor: payload.nextCursor ?? null,
  };
}