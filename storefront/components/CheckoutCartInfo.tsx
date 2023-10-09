import classNames from '@/utils/classNames';
import { CheckoutItem } from './CheckoutItem';
import { Input } from './Input';
import { Button } from './ui/Button';
import { getCurrency } from '@/utils/prices';
import React from 'react';
import { useStore } from '@/lib/context/store-context';
import { Icon } from './ui/Icon';
interface CheckoutCartInfoProps {
  checkoutVisible: boolean;
}
export const CheckoutCartInfo: React.FC<CheckoutCartInfoProps> = ({
  checkoutVisible,
}) => {
  const { cart, addDiscount, deleteDiscount } = useStore();
  const [discount, setDiscount] = React.useState<string>(
    cart?.discounts?.[0]?.code || ''
  );
  const [edit, setEdit] = React.useState(false);

  if (cart) {
    return (
      <li
        className={classNames(
          'hidden px-4 pb-8 lg:!block lg:px-12 lg:pt-31 xl:px-24',
          {
            '!block': checkoutVisible,
          }
        )}
      >
        <div className="mb-8 flex justify-between text-xs lg:mb-16 lg:text-sm">
          <span className="block">Order — {cart?.items.length} item</span>

          <button
            className="relative transition-all before:absolute before:bottom-0 before:left-0 before:w-full before:border-b before:border-gray-900 before:content-[''] hover:font-black hover:before:border-b-2"
            onClick={() => setEdit((prev) => !prev)}
          >
            Edit cart
          </button>
        </div>

        {cart.items.map((item) => (
          <CheckoutItem item={item} edit={edit} />
        ))}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:gap-8">
          <div className="relative w-[100%]">
            <Input
              type="text"
              visualSize="sm"
              label="Discount code"
              wrapperClassName="flex-1"
              colorScheme={
                cart.discount_total && cart.discount_total > 0
                  ? 'secondary'
                  : undefined
              }
              errorMessage=""
              onChange={(e) => setDiscount(e.target.value)}
              disabled={cart.discount_total ? cart.discount_total > 0 : false}
              className="rounded-sm"
              defaultValue={cart.discounts?.[0]?.code}
            />
            {cart.discount_total ? (
              <div className="absolute right-1 top-4">
                <button
                  className={
                    cart.discount_total && cart.discount_total > 0
                      ? 'text-blue-700'
                      : 'text-gray-900 '
                  }
                  onClick={deleteDiscount}
                >
                  <Icon name="x" />
                </button>
              </div>
            ) : null}
          </div>
          <Button
            size="lg"
            variant="tertiary"
            onPress={() => {
              addDiscount(discount || '');
            }}
          >
            Apply
          </Button>
        </div>

        <ul className="w-full [&>li:last-child]:mb-0 [&>li]:mb-2">
          <li>
            <ul className="flex justify-between pr-2 text-xs sm:text-sm">
              <li>Subtotal</li>
              <li>
                {getCurrency(cart)}
                {cart.subtotal ? (cart.subtotal / 100).toFixed(2) : 0}
              </li>
            </ul>
          </li>
          <li className="!mb-6">
            <ul className="flex justify-between pr-2 text-xs sm:text-sm">
              <li>Shipping</li>
              <li>
                {getCurrency(cart)}
                {cart.shipping_total
                  ? (cart.shipping_total / 100).toFixed(2)
                  : 0}
              </li>
            </ul>

            <ul className="flex justify-between pr-2 text-xs sm:text-sm">
              <li>Discount</li>
              <li>
                {getCurrency(cart)}
                {cart.discount_total
                  ? (cart.discount_total / 100).toFixed(2)
                  : 0}
              </li>
            </ul>
          </li>
          <li>
            <ul className="flex justify-between text-md lg:text-lg">
              <li>Total</li>
              <li>
                {getCurrency(cart)}
                {cart.total ? (cart.total / 100).toFixed(2) : 0}
              </li>
            </ul>
          </li>
          <li className="text-xs text-gray-400 sm:text-sm">
            Including {cart.tax_total} tax
          </li>
        </ul>
      </li>
    );
  }
};
