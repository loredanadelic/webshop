'use client';

import { Customer } from '@medusajs/medusa';
import { useMutation } from '@tanstack/react-query';
import { useMeCustomer } from 'medusa-react';
import { useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { medusaClient } from '../config';

import Medusa from '@medusajs/medusa-js';
import { RegisterInfo } from '@/pages/my-account/register';
import { LoginInfo } from '@/pages/my-account/login';
import { useNotification } from './notification-context';
const medusa = new Medusa({ baseUrl: 'http://localhost:9000', maxRetries: 3 });

export enum LOGIN_VIEW {
  SIGN_IN = 'sign-in',
  REGISTER = 'register',
}

interface AccountContext {
  customer?: Omit<Customer, 'password_hash'>;
  retrievingCustomer: boolean;
  loginView: [LOGIN_VIEW, React.Dispatch<React.SetStateAction<LOGIN_VIEW>>];
  checkSession: () => void;
  refetchCustomer: () => void;
  handleLogout: () => void;
  handleLogin: (user: LoginInfo) => void;
  handleRegister: (user: RegisterInfo) => void;
}

const AccountContext = createContext<AccountContext | null>(null);

interface AccountProviderProps {
  children?: React.ReactNode;
}

const handleDeleteSession = () => {
  return medusaClient.auth.deleteSession();
};

export const checkIfCustomerExists = async (email: string) => {
  const { exists } = await medusaClient.auth.exists(email);
  return exists;
};

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const {
    customer,
    isLoading: retrievingCustomer,
    refetch,
    remove,
  } = useMeCustomer({ onError: () => {} });
  const { error } = useNotification();
  const loginView = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN);

  const router = useRouter();

  const handleLogin = useCallback(async ({ email, password }: LoginInfo) => {
    try {
      const { customer } = await medusa.auth.authenticate({
        email: email,
        password: password,
      });
      if (customer) {
        refetch();
      }
    } catch {
      error('Wrong email or password');
    }
  }, []);

  const handleRegister = useCallback(
    async ({ first_name, last_name, email, password }: RegisterInfo) => {
      const { customer } = await medusa.customers.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
      });

      if (customer) {
        refetch();
      }
    },
    []
  );
  const checkSession = useCallback(() => {
    if (!customer && !retrievingCustomer) {
      router.push('/account/login');
    }
  }, [customer, retrievingCustomer, router]);

  const useDeleteSession = useMutation({
    mutationFn: handleDeleteSession,
    mutationKey: ['delete-session'],
  });

  const handleLogout = () => {
    useDeleteSession.mutate(undefined, {
      onSuccess: () => {
        remove();
        loginView[1](LOGIN_VIEW.SIGN_IN);
        router.push('/my-account/login');
      },
    });
  };

  return (
    <AccountContext.Provider
      value={{
        customer,
        retrievingCustomer,
        loginView,
        checkSession,
        refetchCustomer: refetch,
        handleLogout,
        handleLogin,
        handleRegister,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);

  if (context === null) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};
