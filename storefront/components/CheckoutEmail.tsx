import classNames from '@/utils/classNames';
import { Input } from './Input';
import { Button } from './ui/Button';
import React from 'react';
import { useStore } from '@/lib/context/store-context';
import { useAccount } from '@/lib/context/account-context';
interface CheckoutEmailProps {
  step: number;
  setStep: (step: number) => void;
  stepOneNext: (email: string) => void;
}
export const CheckoutEmail: React.FC<CheckoutEmailProps> = ({
  step,
  setStep,
  stepOneNext,
}) => {
  const { cart } = useStore();
  const { customer } = useAccount();
  const [email, setEmail] = React.useState<string>('');

  return (
    <li>
      <ul className="flex items-start justify-between">
        <li
          className={classNames({
            'mb-7 font-black italic text-primary': step === 1,
          })}
        >
          1. Email
        </li>
        {step !== 1 && (
          <li>
            <button
              className="relative transition-all before:absolute before:bottom-0 before:left-0 before:w-full before:border-b before:border-gray-900 before:content-[''] hover:font-black hover:before:border-b-2"
              onClick={() => setStep(1)}
            >
              Change
            </button>
          </li>
        )}
      </ul>

      {step === 1 ? (
        <form>
          <Input
            type="email"
            label="Email"
            name="email"
            defaultValue={customer?.email ? customer.email : cart?.email || ''}
            errorMessage={
              !customer?.email && email === ''
                ? 'Please enter your email'
                : undefined
            }
            wrapperClassName="[&>span]:static"
            disabled={customer ? true : false}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mt-3.5 flex items-start gap-1">
            <input
              type="checkbox"
              name="email"
              id="email"
              className="relative h-4 w-4 shrink-0 cursor-pointer appearance-none border border-gray-400 transition-all checked:border-gray-900 checked:bg-gray-900 checked:before:absolute checked:before:left-[0.1875rem] checked:before:top-[0.1875rem] checked:before:h-[0.3125rem] checked:before:w-2 checked:before:-rotate-45 checked:before:border-b-2 checked:before:border-l-2 checked:before:border-gray-10 checked:before:content-[''] hover:border-primary hover:checked:bg-primary focus-visible:outline-0"
            />
            <label
              htmlFor="email"
              className="cursor-pointer text-xs2 text-gray-400 lg:text-xs"
            >
              Want to get news and offers? Ok, yes and some discounts. But only
              if you subscribe.
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-10.5"
            isDisabled={(!email && !customer?.email) || false}
            onPress={() => stepOneNext(email)}
          >
            Next
          </Button>
        </form>
      ) : (
        <ul className="mt-8 flex">
          <li className="w-1/3 break-words pr-6 text-gray-400 md:w-1/5">
            Email
          </li>

          <li className="w-2/3 break-words text-gray-600 md:w-4/5">
            {cart?.email}
          </li>
        </ul>
      )}
    </li>
  );
};
