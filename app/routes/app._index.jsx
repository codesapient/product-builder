import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <Page title="Product Builder">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Welcome to Product Builder 👋
              </Text>
              <Text variant="bodyMd" tone="subdued" as="p">
                Product Builder lets you manage custom sections for your Shopify product pages — add images, videos, rich text, accordions, and more without touching any code.
              </Text>
              <Text variant="bodyMd" tone="subdued" as="p">
                To get started, go to any product in your Shopify admin and open the Product Builder app from the product page actions.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};