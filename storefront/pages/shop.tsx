import * as React from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';

import type { NextPageWithLayout } from '@/pages/_app';
import DefaultLayout from '@/layouts/DefaultLayout';
import { Heading } from '@/components/ui/Heading';
import { Product } from '@/components/Product';
import { Icon } from '@/components/ui/Icon';
import { PricedProduct } from '@medusajs/medusa/dist/types/pricing';
import { useCart, useProducts } from 'medusa-react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import { medusaClient } from '@/lib/config';

interface ShopFilterProps {
  filterProducts: (filter: string) => void;
}

export const ShopFilter: React.FC<ShopFilterProps> = ({ filterProducts }) => {
  const [filter, setFilter] = React.useState<string>('Whatever');
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className="dropdown-trigger text-gray-300 transition-all hover:text-black">
          <div className="flex text-sm">
            <p>Sort by:</p>

            <Icon
              name="chevron-down"
              className="ml-2 transition-all [&>path]:stroke-gray-300"
            />
          </div>

          <p className="text-sm font-black italic">{filter}</p>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content
        className="dropdown-content w-56.5"
        sideOffset={24}
        align="end"
      >
        <Dropdown.Item
          className={classNames(
            filter === 'Whatever' && 'font-black italic text-primary',
            'dropdown-item'
          )}
          onClick={() => {
            filterProducts('');
            setFilter('Whatever');
          }}
        >
          Whatever
        </Dropdown.Item>
        <Dropdown.Item
          className={classNames(
            filter === 'Newest' && 'font-black italic text-primary',
            'dropdown-item'
          )}
          onClick={() => {
            filterProducts('newest');
            setFilter('Newest');
          }}
        >
          Newest
        </Dropdown.Item>
        <Dropdown.Item
          className={classNames(
            filter === 'Lowest Price' && 'font-black italic text-primary',
            'dropdown-item'
          )}
          onClick={() => {
            filterProducts('lowestPrice');
            setFilter('Lowest Price');
          }}
        >
          Lowest price
        </Dropdown.Item>
        <Dropdown.Item
          className={classNames(
            filter === 'Highest Price' && 'font-black italic text-primary',
            'dropdown-item'
          )}
          onClick={() => {
            filterProducts('highestPrice');
            setFilter('Highest Price');
          }}
        >
          Highest price
        </Dropdown.Item>
        <Dropdown.Item
          className={classNames(
            filter === 'Discount' && 'font-black italic text-primary',
            'dropdown-item'
          )}
          onClick={() => {
            filterProducts('discount');
            setFilter('Discount');
          }}
        >
          Discount
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const ShopPage: NextPageWithLayout = () => {
  const { cart } = useCart();
  const [next, setNext] = React.useState(4);
  const [products, setProducts] = React.useState<PricedProduct[]>();
  const imageNext = 4;
  const handleClick = () => {
    setNext(next + imageNext);
  };
  const [filteredProducts, setFilteredProducts] =
    React.useState<PricedProduct[]>();
  const filterProducts = (filter: string) => {
    let productsArray: PricedProduct[];
    if (filter === 'newest') {
      productsArray = sortBy(products, (products) => -products.created_at!);
    } else if (filter === 'lowestPrice') {
      productsArray = sortBy(
        products,
        (products) => products.variants[0].calculated_price
      );
    } else if (filter === 'highestPrice') {
      productsArray = sortBy(
        products,
        (products) =>
          products.variants[0].calculated_price &&
          -products.variants[0].calculated_price
      );
    } else {
      productsArray = products!;
    }

    setFilteredProducts(productsArray);
  };

  React.useEffect(() => {
    const fetch = () => {
      medusaClient.products
        .list({ cart_id: cart?.id, region_id: cart?.region_id })
        .then(({ products }) => {
          setProducts(products);
        });
    };
    fetch();
  }, [cart?.region_id]);

  if (products || filteredProducts) {
    return (
      <>
        <main className="px-4 py-10 lg:px-24 lg:pb-39.5 lg:pt-17">
          <div className="relative mb-10 flex items-center justify-between lg:mb-19">
            <Heading size="xl6" className="text-primary">
              Shop
            </Heading>

            <ShopFilter filterProducts={filterProducts} />
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-12">
            {(filteredProducts || products || [])
              .slice(0, next)
              .map((product: PricedProduct) => (
                <Product
                  className="col-span-12 md:col-span-6 lg:col-span-3"
                  title={product.title ? product.title : ''}
                  price={product.variants[0].calculated_price || 0}
                  collection={product.collection?.handle || ''}
                  src={
                    product.thumbnail ||
                    '/images/content/item-fresh-bag-white.png'
                  }
                  height={3200}
                  width={2400}
                  alt={product.title ? product.title : ''}
                  linkTo={`/product/${product.id}`}
                  key={product.id}
                  discount={
                    product.variants[0].original_price! >
                    product.variants[0].calculated_price!
                      ? Number(
                          (
                            ((product.variants[0].original_price! -
                              product.variants[0].calculated_price!) /
                              product.variants[0].original_price!) *
                            100
                          ).toFixed(2)
                        )
                      : undefined
                  }
                  discountedPrice={
                    product.variants[0].original_price! >
                    product.variants[0].calculated_price!
                      ? product.variants[0].original_price!
                      : undefined
                  }
                />
              ))}
          </div>

          {products && next < products?.length && (
            <button
              className="relative mx-auto mt-9 block transition-all before:absolute before:bottom-0 before:left-0 before:w-full before:border-b before:border-gray-900 before:content-[''] hover:font-black hover:before:border-b-2"
              onClick={handleClick}
            >
              There is more
            </button>
          )}
        </main>
      </>
    );
  }
};

ShopPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default ShopPage;
