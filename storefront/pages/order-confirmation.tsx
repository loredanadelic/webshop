import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { NextPageWithLayout } from '@/pages/_app';
import DefaultLayout from '@/layouts/DefaultLayout';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AddressPayload } from '@medusajs/medusa';
import { PaymentMethod } from './my-account/payment-method';

interface Order {
  billing_address: AddressPayload;
  shipping_address: AddressPayload;
  payment: string;
  card: PaymentMethod[] | undefined;
  display_id: number;
}

const OrderConfirmationPage: NextPageWithLayout = () => {
  const router = useRouter();
  // const orderId = router.query.id as string;
  const pathname = router.asPath;
  const [order, setOrder] = React.useState<Order>();
  React.useEffect(() => {
    const fetch = async (orderId: string) => {
      const result = await axios.get(
        `http://localhost:9000/store/order_confirmation/${orderId}`
      );
      setOrder(result.data);
    };

    const orderId = pathname?.replace('/order-confirmation?id=', '');
    if (orderId && typeof orderId === 'string') {
      fetch(orderId);
    }
  }, [pathname]);
  if(!order){
    return <p>Loading</p>
  }
  if (order) {
    return (
      <main className="grid-cols-12 px-4 py-10 md:px-24 lg:grid lg:px-0 lg:pb-50 lg:pt-19">
        <span className="col-span-3" />

        <div className="col-span-6">
          <Heading className="mb-14 text-primary" size="xl4">
            Thank you for your order!
          </Heading>

          <div className="mb-16 text-md">
            <p className="mb-6">
              Thank you for your purchase! We are pleased to confirm that your
              order has been successfully placed and will be processed shortly.
            </p>

            <p>
              We have sent you the receipt and order details via{' '}
              <span className="font-bold">e-mail.</span>
            </p>
          </div>

          <div className="mb-16 flex flex-col justify-between gap-20 sm:flex-row">
            <div>
              <p className="mb-2">Your order number is:</p>
              <p className="font-bold">{order.display_id}</p>

              <ul className="mt-8 text-gray-600 sm:mt-16">
                <li className="mb-2">Shipping adress:</li>
                <li>
                  {order.shipping_address?.first_name}{' '}
                  {order.shipping_address?.last_name}
                </li>
                <li>
                  {order.shipping_address?.address_1},{' '}
                  {order.shipping_address?.postal_code}{' '}
                  {order.shipping_address?.city},{' '}
                  {order.shipping_address?.country_code?.toUpperCase()}
                </li>
                <li>{order.shipping_address?.phone}</li>
              </ul>
            </div>

            <div>
              <p className="mb-2">Shipment expected:</p>
              <p className="font-bold">7 Aug - 8 Aug</p>

              <ul className="mt-8 text-gray-600 sm:mt-16">
                <li className="mb-2">Payment: {order.payment.toUpperCase()}</li>
                <li>
                  {order.billing_address?.first_name}{' '}
                  {order.billing_address?.last_name}
                </li>
                {order.card && (
                  <>
                    <li>**** **** **** {order.card[0]?.last4}</li>
                    <li>Exp: {order.card[0]?.exp}</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <Button size="lg" className="w-full" onPress={() => router.push('/')}>
            Go back to home page
          </Button>
        </div>
      </main>
    );
  }
};

OrderConfirmationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default OrderConfirmationPage;
