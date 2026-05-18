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

export async function fetchImageFiles(query = "") {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());

  const res = await fetch(`/api/files?${params.toString()}`);
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.error || "Unable to load files");
  }

  return payload.files ?? [];
}
