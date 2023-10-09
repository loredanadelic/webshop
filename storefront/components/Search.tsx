import React from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { Input } from './Input';
import { useRouter } from 'next/router';
import { medusaClient } from '@/lib/config';
import { Icon } from './ui/Icon';
export interface AlgoliaVariant {
  title: string;
  prices: {
    amount: number;
    currency_code: string;
  }[];
}
export interface AlgoliaProduct {
  objectID: string;
  title: string;
  thumbnail: string;
  handle: string;
  created_at: Date;
  variants: AlgoliaVariant[];
}
export interface SearchProps {
  colorScheme?: 'primary' | 'inverted';
}
export const Search: React.FC<SearchProps> = ({ colorScheme = 'primary' }) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const [products, setProducts] = React.useState<AlgoliaProduct[]>([]);
  React.useEffect(() => {
    const fetch = async () => {
      await medusaClient.products
        .search({
          q: search,
        })
        .then(({ hits }) => {
          setProducts(hits as AlgoliaProduct[]);
        });
    };
    if (search.length > 0) fetch();
    else setProducts([]);
  }, [search]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      router.push({
        pathname: '/search',
        query: { search: search },
      });
      setIsSearchOpen(false);
      setSearch('');
    }
  };
  const handleClick = () => {
    router.push({
      pathname: '/search',
      query: { search: search },
    });
    setIsSearchOpen(false);
    setSearch('');
  };
  return (
    <li className="relative !mr-4 flex">
      <div className="dropdown-full-width">
        <Dropdown.Root open={isSearchOpen} modal={false}>
          <Dropdown.Trigger>
            <Input
              placeholder="Search"
              className={classNames(
                `rounded-sm !pl-13 !pr-9 transition-all md:!py-4 md:placeholder-shown:!py-4 lg:!py-4 lg:placeholder-shown:!py-4`,
                colorScheme === `inverted` && `text-white`
              )}
              wrapperClassName={classNames(
                `w-0 overflow-hidden transition-width`,
                isSearchOpen && `xl:w-84 w-50`
              )}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
              onKeyDown={(e) => {
                handleKeyDown(e);
              }}
            />
          </Dropdown.Trigger>
          <Dropdown.Content
            className="dropdown-content dropdown-content-search"
            sideOffset={0}
            align="end"
          >
            {products.map((product: AlgoliaProduct) => {
              return (
                <Dropdown.Item
                  className={classNames(`dropdown-item hover:bg-transparent`)}
                  id={product.objectID}
                  onClick={() => {
                    router.push({
                      pathname: `/product/${product.objectID}`,
                    });
                  }}
                  key={product.objectID}
                >
                  <h1>{product.title}</h1>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Content>
        </Dropdown.Root>
      </div>
      <button
        className={classNames(
          `absolute right-4 top-4 transition-opacity`,
          isSearchOpen && `opacity-0`
        )}
        onClick={() => setIsSearchOpen(true)}
      >
        <Icon name="search" />
      </button>
      <button
        className={classNames(
          `pointer-events-none absolute right-4 top-4 opacity-0 transition-opacity`,
          isSearchOpen && `pointer-events-auto opacity-100`
        )}
        onClick={() => {
          setIsSearchOpen(false);
          setSearch('');
        }}
      >
        <Icon name="x" />
      </button>
      <button
        className={classNames(
          `transtion-opacity pointer-events-none absolute left-4 top-4 z-10 opacity-0 delay-75 xl:delay-100`,
          isSearchOpen && `pointer-events-auto opacity-100`
        )}
        onClick={handleClick}
      >
        <Icon name="search" className="w-5" />
      </button>
    </li>
  );
};
