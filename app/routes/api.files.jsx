import { authenticate } from "../shopify.server";
import { FILES_QUERY } from "../features/sections/graphql/queries";

function getNameFromUrl(url = "") {
  const filename = url.split("/").pop()?.split("?")[0];
  return filename ? decodeURIComponent(filename) : "Shopify image";
}

function resizeShopifyImage(url, size = "200x200") {
  if (!url) return url;
  return url.replace(/(\.[^.?]+)(\?|$)/, `_${size}$1$2`);
}

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("query")?.trim();
  const after = url.searchParams.get("after") || null;

  const filesRes = await admin.graphql(FILES_QUERY, {
    variables: {
      first: 50,
      query: search ? `filename:*${search}*` : null,
      after,
    },
  });

  const { data, errors } = await filesRes.json();

  if (errors?.length) {
    return Response.json({ error: errors[0].message }, { status: 422 });
  }

  const edges = data?.files?.edges ?? [];
  const pageInfo = data?.files?.pageInfo ?? {};

  const files = edges
    .map(({ node }) => {
      const imageUrl = node.image?.url;
      if (!imageUrl) return null;

      return {
        id: node.id,
        name: getNameFromUrl(imageUrl),
        kind: "IMAGE",
        url: imageUrl,
        thumbnailUrl: resizeShopifyImage(imageUrl, "200x200"),
        alt: node.image?.altText || node.alt || "",
        source: "existing",
      };
    })
    .filter(Boolean);

  return Response.json({
    files,
    hasNextPage: pageInfo.hasNextPage ?? false,
    nextCursor: pageInfo.endCursor ?? null,
  });
};