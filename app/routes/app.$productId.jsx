// app.$productId.jsx
import { useLoaderData } from 'react-router'
import { authenticate } from '../shopify.server'
import { GET_PRODUCT_WITH_SECTIONS, SEARCH_PRODUCTS_QUERY, SEARCH_COLLECTIONS_QUERY, SEARCH_PAGES_QUERY } from '../features/sections/graphql/queries'
import { SET_PRODUCT_GENERAL_SETTINGS, SET_PRODUCT_SECTIONS } from '../features/sections/graphql/mutations'
import SectionsList from '../features/sections/components/SectionsList'
import prisma from '../db.server'

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request)
  const productGid = `gid://shopify/Product/${params.productId}`

  const response = await admin.graphql(GET_PRODUCT_WITH_SECTIONS, {
    variables: { id: productGid }
  })

  const { data } = await response.json()
  return {
    product: {
      ...data.product,
      storeUrl: data.shop?.primaryDomain?.url,
    },
  }
}

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request)
  const formData = await request.formData()
  const intent = formData.get('intent')
  const productGid = `gid://shopify/Product/${params.productId}`

  // ── Resource search for URL picker ────────────────────────────────────────
  if (intent === 'searchResources') {
    const query = formData.get('query') || ''
    const resourceType = formData.get('resourceType')

    const QUERY_MAP = {
      Product: SEARCH_PRODUCTS_QUERY,
      Collection: SEARCH_COLLECTIONS_QUERY,
      Page: SEARCH_PAGES_QUERY,
    }

    const KEY_MAP = {
      Product: 'products',
      Collection: 'collections',
      Page: 'pages',
    }

    const gqlQuery = QUERY_MAP[resourceType]
    if (!gqlQuery) return { success: false, error: 'Invalid resource type' }

    const response = await admin.graphql(gqlQuery, {
      variables: { query, first: 10 },
    })
    const { data } = await response.json()
    const results = data?.[KEY_MAP[resourceType]]?.edges?.map(({ node }) => node) ?? []

    return { intent: 'searchResources', results }
  }

  // ── Save general settings ─────────────────────────────────────────────────
  const generalSettingsJson = formData.get('generalSettings')
  if (typeof generalSettingsJson === 'string') {
    const response = await admin.graphql(SET_PRODUCT_GENERAL_SETTINGS, {
      variables: { productId: productGid, value: generalSettingsJson },
    })
    const { data, errors } = await response.json()

    if (errors?.length) {
      throw new Response(errors.map((e) => e.message).join('\n'), { status: 500 })
    }

    const userErrors = data?.metafieldsSet?.userErrors ?? []
    if (userErrors.length > 0) {
      throw new Response(userErrors.map((e) => e.message).join('\n'), { status: 400 })
    }

    return { success: true }
  }

  // ── Save sections ─────────────────────────────────────────────────────────
  const sectionsJson = formData.get('sections')
  if (typeof sectionsJson !== 'string') {
    return { success: false, error: 'Missing sections payload' }
  }

  const response = await admin.graphql(SET_PRODUCT_SECTIONS, {
    variables: { productId: productGid, value: sectionsJson },
  })
  const { data, errors } = await response.json()

  if (errors?.length) {
    return { success: false, error: errors.map((e) => e.message).join('\n') }
  }

  const userErrors = data?.metafieldsSet?.userErrors ?? []
  if (userErrors.length > 0) {
    return { success: false, error: userErrors.map((e) => e.message).join('\n') }
  }

  let parsedSections
  try {
    parsedSections = JSON.parse(sectionsJson)
  } catch {
    return { success: false, error: 'Invalid sections data. Please reload and try again.' }
  }
  const sectionCount = parsedSections.sections?.length || 0

  try {
    if (sectionCount === 0) {
      await prisma.productSectionIndex.deleteMany({
        where: { shop: session.shop, productId: productGid },
      })
    } else {
      const productResponse = await admin.graphql(GET_PRODUCT_WITH_SECTIONS, {
        variables: { id: productGid },
      })
      const { data: productData } = await productResponse.json()
      const productNode = productData?.product

      if (!productNode) {
        return { success: false, error: 'Sections were saved but the product record could not be refreshed.' }
      }

      await prisma.productSectionIndex.upsert({
        where: { shop_productId: { shop: session.shop, productId: productGid } },
        update: { title: productNode.title, handle: productNode.handle, imageUrl: null, sectionCount },
        create: {
          id: crypto.randomUUID(),
          shop: session.shop,
          productId: productGid,
          title: productNode.title,
          handle: productNode.handle,
          imageUrl: null,
          sectionCount,
        },
      })
    }

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Could not finalize section settings.' }
  }
}

export default function ProductPage() {
  const { product } = useLoaderData()
  return <SectionsList product={product} />
}