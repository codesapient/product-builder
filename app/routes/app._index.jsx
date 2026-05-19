import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Button,
  EmptyState,
  BlockStack,
  Badge,
} from "@shopify/polaris";
import { ExternalIcon } from "@shopify/polaris-icons";

const GET_PRODUCTS_WITH_SECTIONS = `#graphql
  query GetProductsWithSections($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          metafield(namespace: "custom", key: "product_sections") {
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const products = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await admin.graphql(GET_PRODUCTS_WITH_SECTIONS, {
      variables: { first: 250, after },
    });
    const { data, errors } = await response.json();

    if (errors?.length) {
      throw new Response(errors.map((error) => error.message).join("\n"), {
        status: 500,
      });
    }

    products.push(...data.products.edges.map(({ node }) => node));
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

  // only products that have sections saved
  const productsWithSections = products.filter((product) => {
    if (!product.metafield?.value) return false;

    try {
      const parsed = JSON.parse(product.metafield.value);
      return parsed.sections?.length > 0;
    } catch {
      return false;
    }
  });

  return { products: productsWithSections };
};

export default function Index() {
  const { products } = useLoaderData();
  const navigate = useNavigate();

  const goToProduct = (productId) => {
    const id = productId.split("/").pop();
    navigate(`/app/${id}`);
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const rowMarkup = products.map((product, index) => {
    const sectionsData = JSON.parse(product.metafield.value);
    const sectionCount = sectionsData.sections?.length || 0;

    return (
      <IndexTable.Row id={product.id} key={product.id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {product.title}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone="success">{sectionCount} sections</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            variant="plain"
            icon={ExternalIcon}
            onClick={() => goToProduct(product.id)}
            accessibilityLabel={`Edit sections for ${product.title}`}
          >
            Edit
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page title="Product Builder">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {products.length === 0 ? (
              <Card>
                <EmptyState
                  heading="No products with sections yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <Text as="p" tone="subdued">
                    Open any product from the Shopify admin and use the
                    action button to start adding sections.
                  </Text>
                </EmptyState>
              </Card>
            ) : (
              <Card>
                <IndexTable
                  resourceName={resourceName}
                  itemCount={products.length}
                  headings={[
                    { title: "Product" },
                    { title: "Sections" },
                    { title: "Actions" },
                  ]}
                  selectable={false}
                >
                  {rowMarkup}
                </IndexTable>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
