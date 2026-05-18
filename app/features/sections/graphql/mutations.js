// app/features/sections/graphql/mutations.js

export const SET_PRODUCT_SECTIONS = `#graphql
  mutation SetProductSections($productId: ID!, $value: String!) {
    metafieldsSet(metafields: [{
      ownerId: $productId
      namespace: "custom"
      key: "product_sections"
      type: "json"
      value: $value
    }]) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`

// ── Step 1: Request a staged upload target from Shopify ───────────────────────
// Call this first. Shopify returns a signed URL + parameters to POST the file to.

export const STAGED_UPLOADS_CREATE = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

// ── Step 2: Register the uploaded file in Shopify Files ───────────────────────
// Call this after the file has been PUT/POSTed to the staged URL.
// Pass `resourceUrl` from stagedUploadsCreate as `originalSource`.

export const FILE_CREATE = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        ... on MediaImage {
          id
          alt
          createdAt
          image {
            url
            width
            height
            altText
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`