import { useCart } from 'medusa-react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag } from './ui/Tag';
import { getCurrency } from '@/utils/prices';
import { LineItem } from '@medusajs/medusa';
import React from 'react';
import { QuantityInput } from './ui/QuantityInput';
import { Icon } from './ui/Icon';
import { useStore } from '@/lib/context/store-context';

interface CheckoutItemProps {
  item: LineItem;
  edit?: boolean;
}

export const CheckoutItem: React.FC<CheckoutItemProps> = ({ item, edit }) => {
  const { cart, deleteItem, updateItem } = useStore();
  if (cart) {
    return (
      <div className="group mb-8 flex gap-x-2 gap-y-4 lg:gap-x-4" key={item.id}>
        <Link href="/" className="relative block flex-shrink-0">
          <Image
            src={item.thumbnail || '/images/content/item-fresh-bag-white.png'}
            height={144}
            width={108}
            className="min-w-[5.625rem] object-cover sm:w-auto"
            alt={item.title}
          />

          <Tag variant="discount" className="absolute bottom-2 right-2">
            -{cart.discount_total ? (cart.discount_total / 100).toFixed(2) : 0}{' '}
            {getCurrency(cart)}
          </Tag>
        </Link>
        <ul className="relative inline-flex h-full w-full flex-col">
          <li className="text-xs font-black italic lg:text-md">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs sm:text-md">{item.title}</p>
              <ul className="relative items-center gap-2 text-xs sm:mt-0 sm:block sm:self-start">
                <li className="font-bold text-red-700 sm:text-md">
                  {getCurrency(cart)}
                  {item.total ? (item.total / 100).toFixed(2) : 0}
                </li>
                {item.total !== item.subtotal && (
                  <li className="absolute -bottom-6 right-0 font-light text-gray-400 line-through sm:text-sm">
                    {getCurrency(cart)}
                    {item.subtotal ? (item.subtotal / 100).toFixed(2) : 0}
                  </li>
                )}
              </ul>
            </div>
          </li>
          <li className="text-xs2 text-gray-400 lg:text-sm">
            {item.description}
          </li>
          {!edit ? (
            <li className="text-xs2 text-gray-400 lg:text-sm">
              {item.quantity}
            </li>
          ) : (
            <li className="mt-10 flex items-center justify-between gap-2 gap-y-4 lg:gap-x-8">
              <QuantityInput
                defaultValue={item.quantity}
                maxValue={item.variant.inventory_quantity}
                onChange={(value) => {
                  updateItem({ lineId: item.id, quantity: value });
                }}
              />

              <button onClick={() => deleteItem(item.id)}>
                <Icon
                  name="trash"
                  className="transition-all hover:text-primary"
                />
              </button>
            </li>
          )}
        </ul>
      </div>
    );
  }
};
