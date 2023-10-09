import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from './Input';
import React from 'react';
import { ShippingAddress } from '@/lib/context/store-context';

interface FormInputProps {
  label: string;
  errors: FieldErrors<ShippingAddress>;
  control: Control<ShippingAddress, any>;
  name: any;
  type:string
}

export const DeliveryAddressFormInput: React.FC<FormInputProps> = ({
  name,
  label,
  errors,
  control,
  type
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Input
        type={type}
        label={label}
        wrapperClassName="w-full"
        errorMessage={
          errors[name as keyof FieldErrors<ShippingAddress>]?.message
        }
        {...field}
      />
    )}
  />
);
