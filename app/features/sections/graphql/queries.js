export const GET_PRODUCT_WITH_SECTIONS = `#graphql
  query GetProductWithSections($id: ID!) {
    product(id: $id) {
      id
      title
      metafield(namespace: "custom", key: "product_sections") {
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
