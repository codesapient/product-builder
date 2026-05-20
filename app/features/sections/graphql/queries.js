export const GET_PRODUCT_WITH_SECTIONS = `#graphql
  query GetProductWithSections($id: ID!) {
    shop {
      primaryDomain {
        url
      }
    }
    product(id: $id) {
      id
      title
      handle
      onlineStoreUrl
      onlineStorePreviewUrl
      metafield(namespace: "custom", key: "product_sections") {
        id
        value
      }
      generalSettingsMetafield: metafield(namespace: "custom", key: "product_settings") {
        id
        value
      }
    }
  }
`;

export const FILES_QUERY = `#graphql
  query Files($first: Int!, $query: String) {
    files(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          alt
          createdAt
          fileStatus
          ... on MediaImage {
            image {
              url
              width
              height
              altText
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
        }
      }
    }
  }
`;

export const SEARCH_COLLECTIONS_QUERY = `#graphql
  query SearchCollections($query: String!, $first: Int!) {
    collections(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const SEARCH_PAGES_QUERY = `#graphql
  query SearchPages($query: String!, $first: Int!) {
    pages(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;
