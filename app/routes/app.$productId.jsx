// app.$productId.jsx
import { useLoaderData } from 'react-router'
import { authenticate } from '../shopify.server'
import { GET_PRODUCT_WITH_SECTIONS } from '../features/sections/graphql/queries'
import { SET_PRODUCT_SECTIONS } from '../features/sections/graphql/mutations'
import SectionsList from '../features/sections/components/SectionsList'

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
  const { admin } = await authenticate.admin(request)
  const formData = await request.formData()
  const sectionsJson = formData.get('sections')
  const productGid = `gid://shopify/Product/${params.productId}`

  await admin.graphql(SET_PRODUCT_SECTIONS, {
    variables: { productId: productGid, value: sectionsJson }
  })

  return { success: true }
}

export default function ProductPage() {
  const { product } = useLoaderData()
  return <SectionsList product={product} />
}
