import DefaultLayout from '@/layouts/DefaultLayout';
import { NextPageWithLayout } from './_app';
import { Heading } from '@/components/ui/Heading';
import { useRouter } from 'next/router';
import { ShopFilter } from './shop';
import React, { useEffect, useState } from 'react';
import { sortBy } from 'lodash';
import { useCart } from 'medusa-react';
import { Product } from '@/components/Product';
import { medusaClient } from '@/lib/config';
import { AlgoliaProduct } from '@/components/Search';

const SearchPage: NextPageWithLayout = () => {
  const router = useRouter();
  const search = router.query.search || '';
  const { cart } = useCart();

  const [products, setProducts] = useState<AlgoliaProduct[]>([]);
  useEffect(() => {
    const fetch = async () => {
      await medusaClient.products
        .search({
          q: (router.query.search as string) || '',
        })
        .then(({ hits }) => {
          setProducts(hits as AlgoliaProduct[]);
        });
    };
    fetch();
  }, [router.query.search]);

  const [filteredProducts, setFilteredProducts] =
    React.useState<AlgoliaProduct[]>();
  const filterProducts = (filter: string) => {
    let productsArray: AlgoliaProduct[];
    if (filter === 'newest') {
      productsArray = sortBy(products, (products) => -products.created_at!);
    } else if (filter === 'lowestPrice') {
      productsArray = sortBy(
        products,
        (products) => products.variants?.[0]?.prices[0].amount
      );
    } else if (filter === 'highestPrice') {
      productsArray = sortBy(
        products,
        (products) => -products.variants?.[0]?.prices[0].amount
      );
    } else {
      productsArray = products!;
    }

    setFilteredProducts(productsArray);
  };
  return (
    <>
      <main className="px-4 py-10 lg:px-24 lg:pb-39.5 lg:pt-17">
        <div className="relative mb-10 flex items-center justify-between lg:mb-19">
          <Heading size="xl6" className="text-primary">
            "{search}"
            <p className="flex text-sm text-gray-300">
              {products.length} items found
            </p>
          </Heading>
          <ShopFilter filterProducts={filterProducts} />
        </div>
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
          {(filteredProducts || products || []).map(
            (product: AlgoliaProduct) => (
              <Product
                className="col-span-12 md:col-span-6 lg:col-span-3"
                title={product.title ? product.title : ''}
                price={
                  (product.variants?.[0]?.prices[0].currency_code ===
                  cart?.region?.currency_code
                    ? product.variants?.[0]?.prices[0].amount
                    : product.variants?.[0]?.prices[1].amount) || 0
                }
                collection={product.handle || ''}
                src={
                  product.thumbnail ||
                  '/images/content/item-fresh-bag-white.png'
                }
                height={3200}
                width={2400}
                alt={product.title ? product.title : ''}
                linkTo={`/product/${product.objectID}`}
                key={product.objectID}
              />
            )
          )}
        </div>
      </main>
    </>
  );
};

SearchPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default SearchPage;
