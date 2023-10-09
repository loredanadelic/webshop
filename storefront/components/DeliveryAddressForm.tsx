import { Country } from '@medusajs/medusa';
import { Input } from '@/components/Input';
import { useForm } from 'react-hook-form';
import { SelectCountry } from './SelectCountry';
import React from 'react';
import { Button } from './ui/Button';
import { DeliveryAddressFormInput } from './DeliveryAddressFormInput';
import { ShippingAddress, useStore } from '@/lib/context/store-context';
import { ZodType, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
interface AddAddressFormProps {
  setStep: (step: number) => void;
  countries: Country[] | undefined;
}
export const DeliveryAddressForm: React.FC<AddAddressFormProps> = ({
  setStep,

  countries,
}) => {
  const { cart, addShippingAddress } = useStore();
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
    setValue('address_1', cart?.shipping_address?.address_1 || '');
    setValue('city', cart?.shipping_address?.city || '');
    setValue(
      'country_code',
      cart?.shipping_address?.country_code ||
        JSON.parse(localStorage.getItem('medusa_region') || '').countryCode ||
        ''
    );
    setValue('first_name', cart?.shipping_address?.first_name || '');
    setValue('last_name', cart?.shipping_address?.last_name || '');
    setValue('phone', cart?.shipping_address?.phone || '');
    setValue('postal_code', cart?.shipping_address?.postal_code || '');
  };
  const handleSelect = (value: Country | undefined) => {
    setSelectedCountry(value);
    setValue('country_code', value?.iso_2 || '');
  };
  const handleAddAddress = (data: ShippingAddress) => {
    addShippingAddress(data);
    setStep(3);
  };
  React.useEffect(() => {
    settingValuesInForm();
    if (!cart?.shipping_address?.country_code) {
      const country = countries?.find(
        (country) =>
          country.iso_2 ===
          JSON.parse(localStorage.getItem('medusa_region') || '').countryCode
      );
      handleSelect(country);
    } else {
      const country = countries?.find(
        (country) => country.iso_2 === cart.shipping_address?.country_code
      );
      handleSelect(country);
    }
  }, [cart?.id]);
  return (
    <form onSubmit={handleSubmit(handleAddAddress)}>
      <fieldset className="relative flex flex-col flex-wrap gap-y-4 lg:gap-y-8">
        <SelectCountry
          selectedCountry={selectedCountry}
          handleSelect={handleSelect}
          errorMessage={errors.country_code?.message}
          regionId={cart?.region_id}
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
      <Button
        type="submit"
        size="lg"
        className="mt-10"
        isDisabled={Object.keys(errors).length > 0}
      >
        Next
      </Button>
    </form>
  );
};
