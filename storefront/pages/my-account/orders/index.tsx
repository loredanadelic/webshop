import * as React from 'react';
import Image from 'next/image';
import type { NextPageWithLayout } from '@/pages/_app';
import AccountLayout from '@/layouts/AccountLayout';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Heading } from '@/components/ui/Heading';
import { useCustomerOrders } from 'medusa-react';
import { useRouter } from 'next/router';
export const formatDate = (date: Date) => {
  const newDate = new Date(date);
  return newDate.toLocaleDateString();
};
const MyAccountOrdersPage: NextPageWithLayout = () => {
  const { orders, isLoading } = useCustomerOrders({
    expand: 'billing_address',
    limit: 10,
    offset: 0,
  });
  const router = useRouter();
  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!orders) {
    return (
      <div>
        <Heading className="mb-8 text-primary lg:mb-15">My orders</Heading>
        <p>You haven’t order anything yet.</p>
      </div>
    );
  }

  if (orders) {
    return (
      <div>
        <Heading className="mb-8 text-primary lg:mb-15">My orders</Heading>

        <ul className="[&>li:last-child]:mb-0 [&>li]:mb-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-sm border border-gray-200 p-4"
            >
              <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
                <ul>
                  <li className="mb-2 text-md text-primary">
                    Order:{' '}
                    <span className="ml-1 text-black">{order.display_id}</span>
                  </li>

                  <li className="text-xs text-gray-400">
                    Order date:{' '}
                    <span className="ml-2 text-black">
                      {formatDate(order.created_at)}
                    </span>
                  </li>
                </ul>

                <ul className="flex [&>li:last-child]:mr-0 [&>li]:mr-4">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <Image
                        src={
                          item.thumbnail || '/images/content/red-t-shirt.jpg'
                        }
                        height={100}
                        width={75}
                        alt={item.title}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(order.fulfillment_status === 'not_fulfilled' ||
                    order.fulfillment_status === 'partially_fulfilled') && (
                    <Tag icon="package">Packing</Tag>
                  )}
                  {(order.fulfillment_status === 'fulfilled' ||
                    order.fulfillment_status === 'partially_shipped') && (
                    <Tag icon="truck">Delivering</Tag>
                  )}
                  {(order.fulfillment_status === 'shipped' ||
                    order.fulfillment_status === 'returned' ||
                    order.fulfillment_status === 'partially_returned') && (
                    <Tag icon="check">Delivered</Tag>
                  )}

                  <p className="text-xs2 text-gray-400">
                    Estimate delivery:{' '}
                    <span className="ml-1 text-black">29 June 2023</span>
                  </p>
                </div>

                <Button
                  variant="secondary"
                  onPress={() =>
                    router.push(`/my-account/orders/${order.display_id}`)
                  }
                >
                  Check status
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

MyAccountOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AccountLayout>{page}</AccountLayout>;
};

export default MyAccountOrdersPage;
