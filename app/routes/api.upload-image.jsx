// app/routes/api.upload-image.jsx

import { authenticate } from '../shopify.server'
import { STAGED_UPLOADS_CREATE, FILE_CREATE } from '../features/sections/graphql/mutations'

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request)

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  // ── Step 1: Create staged upload target ───────────────────────────────────
  const stagedRes = await admin.graphql(STAGED_UPLOADS_CREATE, {
    variables: {
      input: [{
        resource: 'FILE',
        filename: file.name,
        mimeType: file.type,
        httpMethod: 'POST',
      }],
    },
  })

  const { data: stagedData } = await stagedRes.json()
  const userErrors = stagedData?.stagedUploadsCreate?.userErrors ?? []

  if (userErrors.length) {
    return Response.json({ error: userErrors[0].message }, { status: 422 })
  }

  const target = stagedData?.stagedUploadsCreate?.stagedTargets?.[0]
  if (!target) {
    return Response.json({ error: 'No staged target returned' }, { status: 500 })
  }

  // ── Step 2: POST the file to Shopify's signed URL ─────────────────────────
  const uploadForm = new FormData()
  for (const { name, value } of target.parameters) {
    uploadForm.append(name, value)
  }
  uploadForm.append('file', file)

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: uploadForm,
  })

  if (!uploadRes.ok) {
    return Response.json({ error: 'File upload to staged URL failed' }, { status: 500 })
  }

  // ── Step 3: Register file in Shopify Files ────────────────────────────────
  const fileRes = await admin.graphql(FILE_CREATE, {
    variables: {
      files: [{
        originalSource: target.resourceUrl,
        contentType: 'IMAGE',
      }],
    },
  })

  const { data: fileData } = await fileRes.json()
  const fileErrors = fileData?.fileCreate?.userErrors ?? []

  if (fileErrors.length) {
    return Response.json({ error: fileErrors[0].message }, { status: 422 })
  }

  const createdFile = fileData?.fileCreate?.files?.[0]
  const url = createdFile?.image?.url

  if (!url) {
    // Shopify sometimes processes async — return resourceUrl as fallback
    return Response.json({ url: target.resourceUrl })
  }

  return Response.json({ url })
}