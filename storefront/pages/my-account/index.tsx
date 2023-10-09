import * as React from 'react';
import type { NextPageWithLayout } from '@/pages/_app';
import AccountLayout from '@/layouts/AccountLayout';
import { Button, ButtonIcon } from '@/components/ui/Button';
import * as Dialog from '@/components/ui/Dialog';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/Input';
import { SelectCountry } from '@/components/SelectCountry';
import { useAccount } from '@/lib/context/account-context';
import { MEDUSA_BACKEND_URL, medusaClient } from '@/lib/config';
import Medusa from '@medusajs/medusa-js';
import { Country } from '@medusajs/medusa';
import { useCart, useRegions } from 'medusa-react';
import { sortBy } from 'lodash';
import { ZodType, z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 });
interface CustomerInfo {
  first_name: string;
  last_name: string;
  phone: string;
}
interface AddressInfo {
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
}
interface AddressCustomerInfo {
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  province: string;
  address_2: string;
  metadata: object;
}

const ChangeUserInfoForm: NextPageWithLayout = () => {
  const { customer, refetchCustomer } = useAccount();
  const UpdateCustomerInfo: ZodType<CustomerInfo> = z.object({
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
        /(^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$)|(^(?!.*\S))/
      ),
  });
  type FormSchemaType = z.infer<typeof UpdateCustomerInfo>;

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(UpdateCustomerInfo),
  });
  const changeUserInfo = async (data: CustomerInfo) => {
    const newInfo = await medusa.customers.update(data);
    if (newInfo.response) {
      refetchCustomer();
    }
  };
  if (customer) {
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button
            variant="secondary"
            className="self-start"
            onPress={() => {
              setValue('first_name', customer.first_name);
              setValue('last_name', customer.last_name);
              setValue('phone', customer.phone);
            }}
          >
            Change
          </Button>
        </Dialog.Trigger>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Personal information</Dialog.Title>
          <form
            onSubmit={handleSubmit(changeUserInfo, (err) => console.log(err))}
          >
            <div className="mb-4 flex w-full gap-x-4 lg:mb-8 lg:gap-x-6">
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="First Name"
                    wrapperClassName="flex-1"
                    errorMessage={errors.first_name?.message}
                    {...field}
                  />
                )}
              ></Controller>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    label="Last Name"
                    wrapperClassName="flex-1"
                    errorMessage={errors.last_name?.message}
                    {...field}
                  />
                )}
              ></Controller>
            </div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  label="Phone"
                  errorMessage={errors.phone?.message}
                  wrapperClassName="mb-4 lg:mb-10"
                  {...field}
                />
              )}
            ></Controller>

            <div className="flex justify-between">
              <Dialog.Close asChild>
                <Button
                  variant="primary"
                  type="submit"
                  aria-label="Save changes"
                >
                  Save changes
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button variant="secondary" aria-label="Cancel">
                  Cancel
                </Button>
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    );
  }
};

const MyAccountPage: NextPageWithLayout = () => {
  const { customer, refetchCustomer } = useAccount();
  const { regions } = useRegions();
  const countries = regions?.flatMap((region) => region.countries);
  const [selectedCountry, setSelectedCountry] = React.useState<
    Country | undefined
  >(undefined);
  const [newAddres, setNewAddres] = React.useState<AddressCustomerInfo>({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    province: '',
    address_2: '',
    metadata: {},
  });
  const AddAddressInfo: ZodType<AddressInfo> = z.object({
    address_1: z.string().min(1, { message: 'Address is required' }),
    city: z
      .string()
      .min(1, { message: 'City is required' })
      .regex(/^[A-Za-z]+$/, {
        message: 'Invalid input, only letters allowed',
      }),
    postal_code: z.string().min(1, { message: 'Postal code is required' }),
    country_code: z.string().min(2, { message: 'Choose a country' }),
  });
  type FormSchemaType = z.infer<typeof AddAddressInfo>;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(AddAddressInfo),
  });

  const handleSelect = (value: Country | undefined) => {
    setSelectedCountry(value);
    setValue('country_code', value?.iso_2 || '');
  };
  const handleAddAddress = async (data: AddressInfo) => {
    const addedAddress = await medusa.customers.addresses.addAddress({
      address: {
        ...data,
        ...newAddres,
      },
    });
    if (addedAddress.response) {
      setSelectedCountry(undefined);
      reset();
      refetchCustomer();
    }
  };
  const handleChangeAddress = async (data: AddressInfo, id: string) => {
    const updatedAddress = await medusa.customers.addresses.updateAddress(id, {
      country_code: data.country_code,
      address_1: data.address_1,
      postal_code: data.postal_code,
      city: data.city,
    });
    if (updatedAddress.response) {
      setSelectedCountry(undefined);
      refetchCustomer();
    }
  };
  const primaryAddress = React.useMemo(() => {
    if (customer?.shipping_addresses) {
      return customer.shipping_addresses.find(
        (address) => address.id === customer?.metadata?.primary_address
      );
    }
  }, [customer]);
  const handleSetAsPrimary = (id: string) => {
    medusaClient.customers
      .update({
        metadata: {
          primary_address: id,
        },
      })
      .then(({ customer }) => {
        refetchCustomer();
      });
  };
  return customer && countries ? (
    <div>
      <Heading size="xl" className="mb-8 text-primary lg:mb-15">
        Personal & security
      </Heading>
      <ul className="[&>li:last-child]:mb-0 [&>li]:mb-16">
        <li>
          <p className="mb-6 text-md">Personal information</p>
          <div className="flex flex-wrap justify-between gap-8 rounded-sm border border-gray-200 p-4">
            <Icon name="user" />
            <div className="flex flex-1 flex-wrap gap-8">
              <ul className="flex-1">
                <li className="mb-0.5 text-xs2 text-gray-400">Name</li>
                <li className="text-sm text-black">
                  {customer.first_name} {customer.last_name}
                </li>
              </ul>
              <ul className="flex-1">
                <li className="mb-0.5 text-xs2 text-gray-400">Number</li>
                <li className="break-all text-sm text-black">
                  {customer.phone || '-'}
                </li>
              </ul>
            </div>
            <ChangeUserInfoForm />
          </div>
        </li>
        <li>
          <p className="mb-6 text-md">Contact</p>
          <div className="mb-2 flex rounded-sm border border-gray-200 p-4">
            <Icon name="user" className="shrink-0" />
            <ul className="ml-8">
              <li className="mb-0.5 text-xs2 text-gray-400">Email</li>
              <li className="break-all text-sm text-black">{customer.email}</li>
            </ul>
          </div>
          <p className="text-xs2 text-gray-400">
            If you want to change your email please contact us via customer
            support.
          </p>
        </li>
        <li>
          <p className="mb-6 text-md">Address</p>
          {primaryAddress && (
            <div className="mb-10 flex flex-wrap justify-between gap-8 rounded-sm border border-gray-200 p-4">
              <Icon name="user" className="shrink-0" />
              <div className="mr-auto flex-1 self-start">
                <div className="mb-8 flex gap-8">
                  <ul className="flex-1">
                    <li className="mb-0.5 text-xs2 text-gray-400">Country</li>
                    <li className="text-sm text-black">
                      {
                        countries.find(
                          (country) =>
                            country.iso_2 === primaryAddress.country_code
                        )?.display_name
                      }
                    </li>
                  </ul>

                  <ul className="flex-1">
                    <li className="mb-0.5 text-xs2 text-gray-400">Address</li>
                    <li className="text-sm text-black">
                      {primaryAddress.address_1}
                    </li>
                  </ul>
                </div>
                <ul className="mb-8 flex-1 gap-4">
                  <li className="mb-0.5 text-xs2 text-gray-400">
                    Apartment, suite, etc. (Optional)
                  </li>
                  <li className="text-sm text-black">Kat 2</li>
                </ul>
                <div className="flex gap-8">
                  <ul className="flex-1">
                    <li className="mb-0.5 text-xs2 text-gray-400">
                      Postal Code
                    </li>
                    <li className="text-sm text-black">
                      {primaryAddress.postal_code}
                    </li>
                  </ul>

                  <ul className="flex-1">
                    <li className="mb-0.5 text-xs2 text-gray-400">City</li>
                    <li className="text-sm text-black">
                      {primaryAddress.city}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="ml-auto flex min-h-full w-full flex-wrap items-end justify-between gap-4 md:w-auto md:flex-col">
                <div className="flex gap-x-4">
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <Button
                        variant="secondary"
                        onPress={() => {
                          setNewAddres({
                            first_name: primaryAddress.first_name || '',
                            last_name: primaryAddress.last_name || '',
                            phone: primaryAddress.phone || '',
                            company: primaryAddress.company || '',
                            province: primaryAddress.province || '',
                            address_2: primaryAddress.address_2 || '',
                            metadata: primaryAddress.metadata || {},
                          });
                          const country = countries.find(
                            (country) =>
                              country.iso_2 === primaryAddress.country_code
                          );
                          setSelectedCountry(country);
                          setValue('address_1', primaryAddress.address_1 || '');
                          setValue('city', primaryAddress.city || '');
                          setValue(
                            'postal_code',
                            primaryAddress.postal_code || ''
                          );
                          setValue(
                            'country_code',
                            primaryAddress.country_code || ''
                          );
                        }}
                      >
                        Change
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Overlay />
                    <Dialog.Content>
                      <Dialog.Title>Change address</Dialog.Title>
                      <form
                        onSubmit={handleSubmit((data) =>
                          handleChangeAddress(data, primaryAddress.id)
                        )}
                      >
                        <SelectCountry
                          selectedCountry={selectedCountry}
                          handleSelect={handleSelect}
                          errorMessage={errors.country_code?.message}
                        />
                        <Controller
                          name="address_1"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              label="Address"
                              wrapperClassName="flex-1 mb-4 lg:mb-8 mt-8"
                              errorMessage={errors.address_1?.message}
                              {...field}
                            />
                          )}
                        ></Controller>

                        <Input
                          type="text"
                          label="Apartment, suite, etc. (Optional)"
                          wrapperClassName="flex-1 mb-4 lg:mb-8"
                        />

                        <div className="mb-4 flex w-full gap-x-4 lg:mb-8 lg:gap-x-6">
                          <Controller
                            name="postal_code"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                label="Postal code"
                                wrapperClassName="flex-1"
                                errorMessage={errors.postal_code?.message}
                                {...field}
                              />
                            )}
                          ></Controller>
                          <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                label="City"
                                wrapperClassName="flex-1"
                                errorMessage={errors.city?.message}
                                {...field}
                              />
                            )}
                          ></Controller>
                        </div>
                        <div className="flex justify-between">
                          <Dialog.Close asChild>
                            <Button
                              variant="primary"
                              aria-label="Save changes"
                              type="submit"
                            >
                              Save changes
                            </Button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <Button
                              variant="secondary"
                              aria-label="Cancel"
                              type="button"
                            >
                              Cancel
                            </Button>
                          </Dialog.Close>
                        </div>
                      </form>
                    </Dialog.Content>
                  </Dialog.Root>
                </div>

                <div>
                  <p className="text-sm text-black">Primary address</p>
                </div>
              </div>
            </div>
          )}

          {customer.shipping_addresses.length >= 1 &&
            sortBy(
              customer.shipping_addresses,
              (address) => address.created_at
            ).map(
              (address) =>
                address.id !== customer.metadata?.primary_address && (
                  <div
                    className="mb-10 flex flex-wrap justify-between gap-8 rounded-sm border border-gray-200 p-4"
                    key={address.id}
                  >
                    <Icon name="user" className="shrink-0" />
                    <div className="mr-auto flex-1 self-start">
                      <div className="mb-8 flex gap-8">
                        <ul className="flex-1">
                          <li className="mb-0.5 text-xs2 text-gray-400">
                            Country
                          </li>
                          <li className="text-sm text-black">
                            {
                              countries.find(
                                (country) =>
                                  country.iso_2 === address.country_code
                              )?.display_name
                            }
                          </li>
                        </ul>
                        <ul className="flex-1">
                          <li className="mb-0.5 text-xs2 text-gray-400">
                            Address
                          </li>
                          <li className="text-sm text-black">
                            {address.address_1
                              ? address.address_1
                              : 'Not provided'}
                          </li>
                        </ul>
                      </div>
                      <ul className="mb-8 flex-1 gap-4">
                        <li className="mb-0.5 text-xs2 text-gray-400">
                          Apartment, suite, etc. (Optional)
                        </li>
                        <li className="text-sm text-black">Kat 2</li>
                      </ul>
                      <div className="flex gap-8">
                        <ul className="flex-1">
                          <li className="mb-0.5 text-xs2 text-gray-400">
                            Postal Code
                          </li>
                          <li className="text-sm text-black">
                            {address.postal_code
                              ? address.postal_code
                              : 'Not provided'}
                          </li>
                        </ul>
                        <ul className="flex-1">
                          <li className="mb-0.5 text-xs2 text-gray-400">
                            City
                          </li>
                          <li className="text-sm text-black">
                            {address.city ? address.city : 'Not provided'}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="ml-auto flex min-h-full w-full flex-wrap items-end justify-between gap-4 md:w-auto md:flex-col">
                      <div className="flex gap-x-4">
                        <ButtonIcon
                          size="lg"
                          iconName="trash"
                          variant="secondary"
                          className="py-0"
                          onPress={async () => {
                            const deletedAddress =
                              await medusa.customers.addresses.deleteAddress(
                                address.id
                              );
                            if (deletedAddress.response) {
                              refetchCustomer();
                            }
                          }}
                        />
                        <form
                          onSubmit={handleSubmit((data) =>
                            handleChangeAddress(data, address.id)
                          )}
                        >
                          <Dialog.Root>
                            <Dialog.Trigger asChild>
                              <Button
                                variant="secondary"
                                onPress={() => {
                                  setNewAddres({
                                    first_name: address.first_name || '',
                                    last_name: address.last_name || '',
                                    phone: address.phone || '',
                                    company: address.company || '',
                                    province: address.province || '',
                                    address_2: address.address_2 || '',
                                    metadata: address.metadata || {},
                                  });
                                  const country = countries.find(
                                    (country) =>
                                      country.iso_2 === address.country_code
                                  );
                                  setSelectedCountry(country);
                                  setValue(
                                    'address_1',
                                    address.address_1 || ''
                                  );
                                  setValue('city', address.city || '');
                                  setValue(
                                    'postal_code',
                                    address.postal_code || ''
                                  );
                                  setValue(
                                    'country_code',
                                    address.country_code || ''
                                  );
                                }}
                              >
                                Change
                              </Button>
                            </Dialog.Trigger>
                            <Dialog.Overlay />
                            <Dialog.Content>
                              <Dialog.Title>Change address</Dialog.Title>
                              <SelectCountry
                                selectedCountry={selectedCountry}
                                handleSelect={handleSelect}
                                errorMessage={errors.country_code?.message}
                              />
                              <Controller
                                name="address_1"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    label="Address"
                                    wrapperClassName="flex-1 mb-4 lg:mb-8 mt-8"
                                    errorMessage={errors.address_1?.message}
                                    {...field}
                                  />
                                )}
                              ></Controller>

                              <Input
                                type="text"
                                label="Apartment, suite, etc. (Optional)"
                                wrapperClassName="flex-1 mb-4 lg:mb-8"
                              />

                              <div className="mb-4 flex w-full gap-x-4 lg:mb-8 lg:gap-x-6">
                                <Controller
                                  name="postal_code"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="number"
                                      label="Postal code"
                                      wrapperClassName="flex-1"
                                      errorMessage={errors.postal_code?.message}
                                      {...field}
                                    />
                                  )}
                                ></Controller>
                                <Controller
                                  name="city"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      label="City"
                                      wrapperClassName="flex-1"
                                      errorMessage={errors.city?.message}
                                      {...field}
                                    />
                                  )}
                                ></Controller>
                              </div>
                              <div className="flex justify-between">
                                <Dialog.Close asChild>
                                  <Button
                                    variant="primary"
                                    aria-label="Save changes"
                                    type="submit"
                                    isDisabled={Object.keys(errors).length > 0}
                                  >
                                    Save changes
                                  </Button>
                                </Dialog.Close>
                                <Dialog.Close asChild>
                                  <Button
                                    variant="secondary"
                                    aria-label="Cancel"
                                  >
                                    Cancel
                                  </Button>
                                </Dialog.Close>
                              </div>
                            </Dialog.Content>
                          </Dialog.Root>
                        </form>
                      </div>
                      <div>
                        <Button
                          variant="secondary"
                          onPress={() => handleSetAsPrimary(address.id)}
                        >
                          Set as primary
                        </Button>
                      </div>
                    </div>
                  </div>
                )
            )}

          <form
            onSubmit={handleSubmit(handleAddAddress, (err) => console.log(err))}
          >
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    setNewAddres({
                      first_name: customer.first_name || '',
                      last_name: customer.last_name || '',
                      phone: '',
                      company: '',
                      province: '',
                      address_2: '',
                      metadata: {},
                    });

                    setValue('city', '');
                    setValue('address_1', '');
                    setValue('postal_code', '');
                    setValue(
                      'country_code',
                      JSON.parse(localStorage.getItem('medusa_region') || '')
                        .countryCode || ''
                    );
                    const country = countries.find(
                      (country) =>
                        country.iso_2 ===
                          JSON.parse(
                            localStorage.getItem('medusa_region') || ''
                          ).countryCode || ''
                    );
                    setSelectedCountry(country);
                  }}
                >
                  Add another address
                </Button>
              </Dialog.Trigger>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Title>Add address</Dialog.Title>

                <SelectCountry
                  handleSelect={handleSelect}
                  selectedCountry={selectedCountry}
                  errorMessage={errors.country_code?.message}
                />

                <Controller
                  name="address_1"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      label="Address"
                      wrapperClassName="flex-1 mb-4 lg:mb-8 mt-8"
                      errorMessage={errors.address_1?.message}
                      {...field}
                    />
                  )}
                ></Controller>

                <Input
                  type="text"
                  label="Apartment, suite, etc. (Optional)"
                  wrapperClassName="flex-1 mb-4 lg:mb-8"
                />
                <div className="mb-4 flex w-full gap-x-4 lg:mb-8 lg:gap-x-6">
                  <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        label="Postal code"
                        wrapperClassName="flex-1"
                        errorMessage={errors.postal_code?.message}
                        {...field}
                      />
                    )}
                  ></Controller>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        label="City"
                        wrapperClassName="flex-1"
                        errorMessage={errors.city?.message}
                        {...field}
                      />
                    )}
                  ></Controller>
                </div>
                <div className="flex justify-between">
                  <Dialog.Close asChild>
                    <Button
                      variant="primary"
                      aria-label="Save changes"
                      type="submit"
                      isDisabled={Object.keys(errors).length > 0}
                    >
                      Add address
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
          </form>
        </li>
        <li>
          <p className="mb-6 text-md">Change password</p>
          <p className="mb-12 text-gray-500">
            Perhaps you&apos;ve scribbled your password on a scrap of paper or
            you&apos;re the type who likes to change it every now and then to
            feel safer. Or maybe you had a rough weekend, and well, we know what
            can happen on weekends ( ͡° ͜ʖ ͡°). No worries, to change your
            password, we&apos;ll send you an email. Just click on the reset
            button below.
          </p>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button size="lg">Reset password</Button>
            </Dialog.Trigger>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Close asChild>
                <button className="absolute right-4 top-4 text-gray-900">
                  <Icon name="x" />
                </button>
              </Dialog.Close>
              <Dialog.Title>Personal information</Dialog.Title>
              <div className="text-xs text-gray-500">
                <p>
                  We have sent an email with instructions on how to <br />
                  change the password.
                </p>
              </div>
            </Dialog.Content>
          </Dialog.Root>
        </li>
      </ul>
    </div>
  ) : (
    <p>Not logged in</p>
  );
};

MyAccountPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AccountLayout>{page}</AccountLayout>;
};
export default MyAccountPage;
