import React from "react"
import { Product } from "./Product"
import { AlgoliaProduct } from "./Search"
import { useCart } from "medusa-react"

interface RecommendedProductsProps{
    recommendedProducts: AlgoliaProduct[]
}

export const RecommendedProducts: React.FC<RecommendedProductsProps>=({recommendedProducts})=>{
    const {cart}=useCart()
    return <div className="hidden lg:block ">
    <p className="mb-4 mt-8 text-lg text-gray-500">
      Recommended products
    </p>
    <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
      {recommendedProducts.map((hit: AlgoliaProduct) => (
        <Product
          className="col-span-12 md:col-span-6 lg:col-span-3"
          title={hit.title ? hit.title : ''}
          price={
            (hit.variants?.[0]?.prices[0].currency_code ===
            cart?.region?.currency_code
              ? hit.variants?.[0]?.prices[0].amount
              : hit.variants?.[0]?.prices[1].amount) || 0
          }
          collection={hit.handle || ''}
          src={
            hit.thumbnail ||
            '/images/content/item-fresh-bag-white.png'
          }
          height={3200}
          width={2400}
          alt={hit.title ? hit.title : ''}
          linkTo={`/product/${hit.objectID}`}
          key={hit.objectID}
        />
      ))}
    </div>
  </div>
}