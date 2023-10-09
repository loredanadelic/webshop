import React from 'react';
import { Input } from './Input';
import { SelectCountry } from './SelectCountry';
import { Button } from './ui/Button';
import { Country } from '@medusajs/medusa';
import { ZodType, z } from 'zod';
import { ShippingAddress, useStore } from '@/lib/context/store-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeliveryAddressFormInput } from './DeliveryAddressFormInput';
import { medusaClient } from '@/lib/config';
import { useAccount } from '@/lib/context/account-context';

interface CheckoutBillingProps {
  showBillingForm: boolean;
  setShowBillingForm: (showBillingForm: boolean) => void;
  countries: Country[] | undefined;
}

export const CheckoutBilling: React.FC<CheckoutBillingProps> = ({
  showBillingForm,
  setShowBillingForm,
  countries,
}) => {
  const { cart, addBillingAddress } = useStore();
  const { refetchCustomer, customer } = useAccount();
  const [selectedCountry, setSelectedCountry] = React.useState<
    Country | undefined
  >(undefined);
  const AddAddressInfo: ZodType<ShippingAddress> = z.object({
    address_1: z.string().min(1, { message: 'Address is required' }),
    city: z
      .string()
      .min(1, { message: 'City is required' })
      .regex(/^[A-Za-z]+$/, {
        message: 'Invalid input, only letters allowed',
      }),
    postal_code: z.string().min(1, { message: 'Postal code is required' }),
    first_name: z
      .string()
      .min(1, { message: 'First name is required' })
      .regex(/^[A-Za-z]+$/, {
        message: 'Invalid input, only letters allowed',
      }),
    last_name: z
      .string()
      .min(1, { message: 'Last name is required' })
      .regex(/^[A-Za-z]+$/, {
        message: 'Invalid input, only letters allowed',
      }),
    phone: z
      .string()
      .regex(
        /(^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$)|(^(?!.*\S))/,
        { message: 'Enter number or leave empty' }
      ),
    country_code: z.string().min(2, { message: 'Choose a country' }),
  });
  type FormSchemaType = z.infer<typeof AddAddressInfo>;

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(AddAddressInfo),
  });
  const settingValuesInForm = () => {
    setValue('address_1', cart?.billing_address?.address_1 || '');
    setValue('city', cart?.billing_address?.city || '');
    setValue(
      'country_code',
      cart?.billing_address?.country_code ||
        JSON.parse(localStorage.getItem('medusa_region') || '').countryCode ||
        ''
    );
    setValue('first_name', cart?.billing_address?.first_name || '');
    setValue('last_name', cart?.billing_address?.last_name || '');
    setValue('phone', cart?.billing_address?.phone || '');
    setValue('postal_code', cart?.billing_address?.postal_code || '');
  };
  const handleSelect = (value: Country | undefined) => {
    setSelectedCountry(value);
    setValue('country_code', value?.iso_2 || '');
  };
  const handleAddAddress = async (data: ShippingAddress) => {
    if(customer){
    await changeUserInfo(data);}
    else{
      addBillingAddress(data);
      setShowBillingForm(false);
    }
  };
  const changeUserInfo = async (data: ShippingAddress) => {
    const newInfo = await medusaClient.customers.update({
      billing_address: data,
    });
    if (newInfo) {
      refetchCustomer();
      addBillingAddress(data);
      setShowBillingForm(false);
    }
  };
  React.useEffect(() => {
    settingValuesInForm();
    if (!cart?.billing_address?.country_code && !customer?.billing_address) {
      const country = countries?.find(
        (country) =>
          country.iso_2 ===
          JSON.parse(localStorage.getItem('medusa_region') || '').countryCode
      );
      handleSelect(country);
    } else if (cart?.billing_address) {
      const country = countries?.find(
        (country) => country.iso_2 === cart?.billing_address?.country_code
      );
      handleSelect(country);
    } else {
      const country = countries?.find(
        (country) => country.iso_2 === customer?.billing_address?.country_code
      );
      handleSelect(country);
    }
  }, [cart?.id]);
  if (cart) {
    return (
      <ul className="mb-7 text-gray-600 [&>li:first-child]:mb-2 [&>li:first-child]:text-primary">
        <li>
          <ul className="flex justify-between">
            <li>Billing address</li>
            {!showBillingForm && (
              <button
                className="relative text-black transition-all before:absolute before:bottom-0 before:left-0 before:w-full before:border-b before:border-gray-900 before:content-[''] hover:font-black hover:before:border-b-2"
                onClick={() => setShowBillingForm(true)}
              >
                Change
              </button>
            )}
          </ul>
        </li>
        {showBillingForm ? (
          <div className="mt-5">
            <form onSubmit={handleSubmit(handleAddAddress)}>
              <fieldset className="relative flex flex-col flex-wrap gap-y-4 lg:gap-y-8">
                <SelectCountry
                  selectedCountry={selectedCountry}
                  handleSelect={handleSelect}
                  errorMessage={errors.country_code?.message}
                />
                <div className="flex gap-x-4 lg:gap-x-12">
                  <DeliveryAddressFormInput
                    name="first_name"
                    label="First Name"
                    errors={errors}
                    control={control}
                    type="text"
                  />
                  <DeliveryAddressFormInput
                    name="last_name"
                    label="Last Name"
                    errors={errors}
                    control={control}
                    type="text"
                  />
                </div>
                <DeliveryAddressFormInput
                  name="address_1"
                  label="Address"
                  errors={errors}
                  control={control}
                  type="text"
                />
                <Input
                  type="text"
                  label="Apartment, suite, etc. (Optional)"
                  name="apartment"
                />
                <div className="flex gap-x-4 lg:gap-x-12">
                  <DeliveryAddressFormInput
                    name="postal_code"
                    label="Postal Code"
                    errors={errors}
                    control={control}
                    type="number"
                  />
                  <DeliveryAddressFormInput
                    name="city"
                    label="City"
                    errors={errors}
                    control={control}
                    type="text"
                  />
                </div>
                <DeliveryAddressFormInput
                  name="phone"
                  label="Phone"
                  errors={errors}
                  control={control}
                  type="text"
                />
              </fieldset>

              <Button size="lg" className="mt-10" type="submit">
                Save
              </Button>
            </form>
          </div>
        ) : (
          <ul>
            <li>
              {cart.billing_address?.first_name || ''}{' '}
              {cart.billing_address?.last_name || ''}
            </li>
            <li>
              {cart.billing_address?.address_1 || ''},{' '}
              {cart.billing_address?.postal_code || ''}{' '}
              {cart.billing_address?.city || ''},{' '}
              {
                (countries || []).find(
                  (country) =>
                    country.iso_2 === cart.billing_address?.country_code
                )?.display_name
              }
            </li>
            <li>{cart?.billing_address?.phone || ''}</li>
          </ul>
        )}
      </ul>
    );
  }
};
