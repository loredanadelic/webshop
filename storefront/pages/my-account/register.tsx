import * as React from 'react';
import Link from 'next/link';

import type { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/Input';
import { Heading } from '@/components/ui/Heading';
import {
  checkIfCustomerExists,
  useAccount,
} from '@/lib/context/account-context';
import { useRouter } from 'next/router';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z, { ZodType } from 'zod';

export interface RegisterInfo {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const MyAccountRegisterPage: NextPageWithLayout = () => {
  const { customer, handleRegister } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const RegisterUser: ZodType<RegisterInfo> = z
    .object({
      first_name: z
        .string()
        .min(1, { message: 'Firstname is required' })
        .regex(/^[A-Za-z]+$/, {
          message: 'Invalid input, only letters allowed',
        }),
      last_name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(4),
      confirm_password: z.string().min(4),
    })
    .superRefine(async ({ confirm_password, password, email }, ctx) => {
      if (confirm_password !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'The passwords did not match',
          path: ['confirm_password'],
        });
      }
      if (email !== '') {
        if (await checkIfCustomerExists(email)) {
          ctx.addIssue({
            code: 'custom',
            message: 'User already exists',
            path: ['email'],
          });
        }
      }
    });
  type FormSchemaType = z.infer<typeof RegisterUser>;
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(RegisterUser),
  });
  const onSubmit = (data: RegisterInfo) => {
    handleRegister(data);
    setIsLoading(true);
    return data;
  };

  React.useEffect(() => {
    if (customer) {
      router.push('/my-account');
    }
  }, [customer]);

  return (
    <div className="w-full max-w-sm">
      <Heading className="mb-8 !leading-[1.1] text-primary lg:mb-14" size="xl3">
        Hey gorgeous,
        <br /> welcome to red
      </Heading>

      <form
        className="mb-4 xl:mb-16"
        onSubmit={handleSubmit(onSubmit, (err) => console.log(err))}
      >
        <div className="mb-4 flex flex-col gap-x-6 gap-y-4 sm:flex-row lg:mb-8 lg:gap-y-8">
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
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              type="email"
              label="Email"
              wrapperClassName="mb-4 lg:mb-8"
              errorMessage={errors.email?.message}
              {...field}
            />
          )}
        ></Controller>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              type="password"
              label="Password"
              wrapperClassName="mb-4 lg:mb-8"
              errorMessage={errors.password?.message}
              {...field}
            />
          )}
        ></Controller>
        <Controller
          name="confirm_password"
          control={control}
          render={({ field }) => (
            <Input
              type="password"
              label="Confirm Password"
              wrapperClassName="mb-8"
              errorMessage={errors.confirm_password?.message}
              {...field}
            />
          )}
        ></Controller>
        <Button
          size="lg"
          className="w-full"
          isLoading={isLoading}
          type="submit"
        >
          Register
        </Button>
      </form>

      <p className="text-gray-400">
        Already red? No worrier, just{' '}
        <Link
          href="/my-account/login"
          className="relative ml-1 cursor-pointer text-primary before:absolute before:-bottom-1 before:h-[0.0625rem] before:w-full before:bg-primary hover:text-primary-900 hover:before:bg-primary-900"
        >
          log in
        </Link>
      </p>
    </div>
  );
};

MyAccountRegisterPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default MyAccountRegisterPage;
