import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { NextPageWithLayout } from '@/pages/_app';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/Input';
import { Heading } from '@/components/ui/Heading';
import { useAccount } from '@/lib/context/account-context';
import { Notification } from '@/components/Notification';
import { useNotification } from '@/lib/context/notification-context';

export interface LoginInfo {
  email: string;
  password: string;
}
const MyAccountLoginPage: NextPageWithLayout = () => {
  const { customer, handleLogin } = useAccount();
  const router = useRouter();
  const [loginInfo, setLoginInfo] = React.useState<LoginInfo>({
    email: '',
    password: '',
  });
  const { getNotification } = useNotification();
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    setIsLoading(false);
  }, [getNotification().notification]);

  React.useEffect(() => {
    if (customer) {
      router.push('/my-account');
    }
  }, [customer]);

  return (
    <div className="w-full max-w-sm">
      <Heading className="mb-8 !leading-[1.1] text-primary lg:mb-16" size="xl3">
        Hey gorgeous,
        <br /> welcome back
      </Heading>

      <form className="mb-4 xl:mb-16">
        <Input
          type="email"
          label="Email"
          wrapperClassName="mb-4 lg:mb-8"
          onChange={(e) =>
            setLoginInfo({ ...loginInfo, email: e.target.value })
          }
        />

        <Input
          type="password"
          label="Password"
          wrapperClassName="mb-4 lg:mb-8"
          onChange={(e) =>
            setLoginInfo({ ...loginInfo, password: e.target.value })
          }
        />
        <Button
          size="lg"
          className="w-full"
          isLoading={isLoading}
          onPress={() => {
            handleLogin(loginInfo);
            setIsLoading(true);
          }}
        >
          Log in
        </Button>
      </form>

      <p className="text-gray-400">
        Not red yet? Bro just{' '}
        <Link
          href="/my-account/register"
          className="relative ml-1 cursor-pointer text-primary before:absolute before:-bottom-1 before:h-[0.0625rem] before:w-full before:bg-primary hover:text-primary-900 hover:before:bg-primary-900"
        >
          sign up
        </Link>
      </p>
      <Notification className='max-w-md'/>
    </div>
  );
};

MyAccountLoginPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export default MyAccountLoginPage;
