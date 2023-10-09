import { medusaClient } from '@/lib/config';
import { useStore } from '@/lib/context/store-context';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import React from 'react';
import { useRouter } from 'next/router';
import { Button } from './ui/Button';

interface CardFormProps {
  clientSecret: any;
}

export const CardForm: React.FC<CardFormProps> = ({ clientSecret }) => {
  const stripe = useStripe();
  const { resetCart } = useStore();
  const router = useRouter();
  const elements = useElements();

  const { cart } = useStore();
 const [loading, setLoading]=React.useState(false)
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!elements) {
      return;
    }
    setLoading(true)
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setLoading(false)
      console.log(submitError)
      return;
    }
    
    return stripe
      ? stripe
          .confirmPayment({
            clientSecret,
            elements,
            redirect: 'if_required',
            confirmParams: {
              return_url: 'http://localhost:3000',
              payment_method_data: {
                billing_details: {
                  address: {
                    city: cart?.billing_address.city || '',
                    line1: cart?.billing_address.address_1 || '',
                    country: cart?.billing_address.country_code || '',
                    postal_code: cart?.billing_address.postal_code || '',
                  },
                  email: cart?.email,
                  name: cart?.billing_address.first_name || '',
                },
              },
            },
          })
          .then(async ({ error }) => {
            if (error) {
              console.log(error);
            }
            // TODO handle errors
            else {
               medusaClient.carts.complete(cart!.id).then((resp) =>
                router
                  .push({
                    pathname: '/order-confirmation',
                    query: { id: resp.data.id },
                  })
                  .then(() => resetCart())
              );
            }
            setLoading(false)
          })
      : '';
  }

  return (
    <form onSubmit={handlePayment}>
      <PaymentElement
        options={{
          wallets: {
            googlePay: 'auto',
            applePay: "auto"
          },
        }}
      />
      <Button size="lg" className="mt-10 w-full" type="submit" isLoading={loading}>
        Place an order
      </Button>
    </form>
  );
};
