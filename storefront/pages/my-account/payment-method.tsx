import * as React from 'react';
import Image from 'next/image';
import axios from 'axios';
import type { NextPageWithLayout } from '@/pages/_app';
import AccountLayout from '@/layouts/AccountLayout';
import { Button, ButtonIcon } from '@/components/ui/Button';
import * as Dialog from '@/components/ui/Dialog';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/Input';
import { useAccount } from '@/lib/context/account-context';
import { medusaClient } from '@/lib/config';

export interface PaymentMethod {
  last4: number;
  first_name: string;
  exp: string;
  brand: string;
}
const MyAccountPaymentMethodsPage: NextPageWithLayout = () => {
  // must be previously logged
  const { customer } = useAccount();
  const [order, setOrder] = React.useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(
    []
  );
  React.useEffect(() => {
    const fetch = async () => {
      const orders = (
        await medusaClient.customers.listOrders({ limit: 20, offset: 20 })
      ).orders;
      const paymentsMethods = orders
        .map((order) => order.payments[0].data.payment_method as string)
        .filter((pm) => !!pm);
      setOrder(paymentsMethods);
    };
    fetch();
  }, [customer?.id]);
  React.useEffect(() => {
    const fetch = () => {
      axios
        .post(
          `http://localhost:9000/store/stripe-customer/${
            customer!.metadata.stripe_id
          }`,
          {
            paymentMethodIds: order,
          }
        )
        .then((res) => setPaymentMethods(res.data));
    };
    if (customer?.metadata.stripe_id) {
      fetch();
    }
  }, [order.length, customer?.id]);
  if (paymentMethods.length > 0) {
    return (
      <div>
        <Heading className="mb-8 text-primary lg:mb-15" size="xl">
          Payment methods
        </Heading>

        <p className="text-md">Credit and debit cards</p>

        {paymentMethods.map((method, i) => (
          <div
            className="mt-6 flex flex-wrap items-start justify-between gap-6 rounded-sm border border-gray-200 p-4"
            id={i.toString()}
          >
            <div className="flex items-start">
              <Image
                src={`/images/content/${method.brand}.png`}
                height={24}
                width={34}
                alt={method.brand}
              />
              <ul className="ml-14">
                <li>{method.first_name}</li>
                <li>**** **** **** {method.last4}</li>
                <li>Exp: {method.exp}</li>
              </ul>
            </div>

            <div className="flex items-start">
              <ButtonIcon size="lg" iconName="trash" variant="secondary" />

              <Button size="lg" variant="secondary" className="ml-3">
                Change
              </Button>
            </div>
          </div>
        ))}

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="lg" className="mt-10">
              Add another card
            </Button>
          </Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Add credit or debit card</Dialog.Title>
            <Input
              type="text"
              label="Name on card"
              wrapperClassName="mb-4 lg:mb-8"
            />
            <Input
              type="number"
              label="Card number"
              wrapperClassName="mb-4 lg:mb-8"
            />
            <div className="mb-4 flex w-full gap-x-4 lg:mb-8 lg:gap-x-6">
              <Input type="number" label="MM/YY" wrapperClassName="flex-1" />
              <Input type="number" label="CVC" wrapperClassName="flex-1" />
            </div>
            <div className="flex justify-between">
              <Dialog.Close asChild>
                <Button variant="primary" aria-label="Save changes">
                  Add card
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button variant="secondary" aria-label="Cancel">
                  Cancel
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    );
  }
};

MyAccountPaymentMethodsPage.getLayout = function getLayout(
  page: React.ReactElement
) {
  return <AccountLayout>{page}</AccountLayout>;
};

export default MyAccountPaymentMethodsPage;
