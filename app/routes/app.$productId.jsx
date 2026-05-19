// app.$productId.jsx
import { useLoaderData } from 'react-router'
import { authenticate } from '../shopify.server'
import { GET_PRODUCT_WITH_SECTIONS } from '../features/sections/graphql/queries'
import { SET_PRODUCT_SECTIONS } from '../features/sections/graphql/mutations'
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
  const sectionsJson = formData.get('sections')
  const productGid = `gid://shopify/Product/${params.productId}`

  const response = await admin.graphql(SET_PRODUCT_SECTIONS, {
    variables: { productId: productGid, value: sectionsJson }
  })
  const { data, errors } = await response.json()

  if (errors?.length) {
    throw new Response(errors.map((error) => error.message).join('\n'), {
      status: 500,
    })
  }

  const userErrors = data?.metafieldsSet?.userErrors ?? []
  if (userErrors.length > 0) {
    throw new Response(userErrors.map((error) => error.message).join('\n'), {
      status: 400,
    })
  }

  const parsedSections = JSON.parse(sectionsJson)
  const sectionCount = parsedSections.sections?.length || 0

  if (sectionCount === 0) {
    await prisma.productSectionIndex.deleteMany({
      where: { shop: session.shop, productId: productGid },
    })
  } else {
    const productResponse = await admin.graphql(GET_PRODUCT_WITH_SECTIONS, {
      variables: { id: productGid }
    })
    const { data: productData } = await productResponse.json()

    await prisma.productSectionIndex.upsert({
      where: {
        shop_productId: {
          shop: session.shop,
          productId: productGid,
        },
      },
      update: {
        title: productData.product.title,
        handle: productData.product.handle,
        imageUrl: null,
        sectionCount,
      },
      create: {
        id: crypto.randomUUID(),
        shop: session.shop,
        productId: productGid,
        title: productData.product.title,
        handle: productData.product.handle,
        imageUrl: null,
        sectionCount,
      },
    })
  }

  return { success: true }
}

export default function ProductPage() {
  const { product } = useLoaderData()
  return <SectionsList product={product} />
}
