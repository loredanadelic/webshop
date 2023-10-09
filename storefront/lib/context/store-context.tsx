'use client';
import { Cart, Region } from '@medusajs/medusa';
import {
  useCart,
  useCreateLineItem,
  useDeleteLineItem,
  useUpdateLineItem,
  useAddShippingMethodToCart,
} from 'medusa-react';
import React, { useEffect, useState } from 'react';
import { medusaClient } from '../config';
import { useCartDropdown } from './cart-dropdown-context';
import { handleError } from '../util/handle-error';
import { useNotification } from './notification-context';

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
}

interface VariantInfoProps {
  variantId: string;
  quantity: number;
}

interface LineInfoProps {
  lineId: string;
  quantity: number;
}

interface StoreContext {
  countryCode: string | undefined;
  setRegion: (regionId: string, countryCode: string) => void;
  addItem: (item: VariantInfoProps) => void;
  updateItem: (item: LineInfoProps) => void;
  deleteItem: (lineId: string) => void;
  resetCart: () => void;
  cart: Omit<Cart, 'refunded_total' | 'refundable_amount'> | undefined;
  addShipping: (option_id: string) => void;
  addDiscount: (discount: string) => void;
  deleteDiscount: () => void;
  updateEmail: (email: string) => void;
  addShippingAddress: (address: ShippingAddress) => void;
  addBillingAddress: (address: ShippingAddress) => void;
  addShippingAndBillingAddress: (
    address: ShippingAddress,
    address_2: ShippingAddress
  ) => void;
}

const StoreContext = React.createContext<StoreContext | null>(null);

export const useStore = () => {
  const context = React.useContext(StoreContext);
  if (context === null) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

interface StoreProps {
  children: React.ReactNode;
}

const IS_SERVER = typeof window === 'undefined';
const CART_KEY = 'medusa_cart_id';
const REGION_KEY = 'medusa_region';

export const StoreProvider = ({ children }: StoreProps) => {
  const { cart, setCart, createCart, updateCart } = useCart();
  const {error}=useNotification()
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const { timedOpen } = useCartDropdown();
  const addLineItem = useCreateLineItem(cart?.id!);
  const removeLineItem = useDeleteLineItem(cart?.id!);
  const adjustLineItem = useUpdateLineItem(cart?.id!);
  const addShippingMethod = useAddShippingMethodToCart(cart?.id!);

  const storeRegion = (regionId: string, countryCode: string) => {
    if (!IS_SERVER) {
      localStorage.setItem(
        REGION_KEY,
        JSON.stringify({ regionId, countryCode })
      );

      setCountryCode(countryCode);
    }
  };

  useEffect(() => {
    if (!IS_SERVER) {
      const storedRegion = localStorage.getItem(REGION_KEY);
      if (storedRegion) {
        const { countryCode } = JSON.parse(storedRegion);
        setCountryCode(countryCode);
      }
    }
  }, []);

  const getRegion = () => {
    if (!IS_SERVER) {
      const region = localStorage.getItem(REGION_KEY);
      if (region) {
        return JSON.parse(region) as { regionId: string; countryCode: string };
      }
    }
    return null;
  };

  const setRegion = async (regionId: string, countryCode: string) => {
    await updateCart.mutateAsync(
      {
        region_id: regionId,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          storeRegion(regionId, countryCode);
        },
        onError: (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(error);
          }
        },
      }
    );
  };

  const ensureRegion = (region: Region, countryCode?: string | null) => {
    if (!IS_SERVER) {
      const { regionId, countryCode: defaultCountryCode } = getRegion() || {
        regionId: region.id,
        countryCode: region.countries[0].iso_2,
      };

      const finalCountryCode = countryCode || defaultCountryCode;

      if (regionId !== region.id) {
        setRegion(region.id, finalCountryCode);
      }

      storeRegion(region.id, finalCountryCode);
      setCountryCode(finalCountryCode);
    }
  };

  const storeCart = (id: string) => {
    if (!IS_SERVER) {
      localStorage.setItem(CART_KEY, id);
    }
  };

  const getCart = () => {
    if (!IS_SERVER) {
      return localStorage.getItem(CART_KEY);
    }
    return null;
  };

  const deleteCart = () => {
    if (!IS_SERVER) {
      localStorage.removeItem(CART_KEY);
    }
  };

  const deleteRegion = () => {
    if (!IS_SERVER) {
      localStorage.removeItem(REGION_KEY);
    }
  };

  const createNewCart = async (regionId?: string) => {
    await createCart.mutateAsync(
      { region_id: regionId },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          ensureRegion(cart.region, cart.shipping_address?.country_code);
        },
        onError: (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(error);
          }
        },
      }
    );
  };

  const resetCart = () => {
    deleteCart();

    const savedRegion = getRegion();

    createCart.mutate(
      {
        region_id: savedRegion?.regionId,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          ensureRegion(cart.region, cart.shipping_address?.country_code);
        },
        onError: (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(error);
          }
        },
      }
    );
  };

  useEffect(() => {
    const ensureCart = async () => {
      const cartId = getCart();
      const region = getRegion();

      if (cartId) {
        const cartRes = await medusaClient.carts
          .retrieve(cartId)
          .then(({ cart }) => {
            return cart;
          })
          .catch(async (_) => {
            return null;
          });

        if (!cartRes || cartRes.completed_at) {
          deleteCart();
          deleteRegion();
          await createNewCart();
          return;
        }

        setCart(cartRes);
        ensureRegion(cartRes.region);
      } else {
        await createNewCart(region?.regionId);
      }
    };

    if (!IS_SERVER && !cart?.id) {
      ensureCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = ({
    variantId,
    quantity,
  }: {
    variantId: string;
    quantity: number;
  }) => {
    addLineItem.mutate(
      {
        variant_id: variantId,
        quantity: quantity,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const addShipping = async (option_id: string) => {
    await addShippingMethod.mutateAsync(
      {
        option_id,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };
  const addDiscount = (discount: string) => {
    updateCart.mutate(
      {
        discounts: [{ code: discount || '' }],
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (err) => {
          handleError(err);
          error("Wrong discount code")
        },
      }
    );
  };
  const deleteDiscount = () => {
    updateCart.mutate(
      { discounts: [] },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const addShippingAddress = (address: ShippingAddress) => {
    updateCart.mutate(
      {
        shipping_address: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          city: address.city,
          country_code: address.country_code,
          postal_code: address.postal_code,
          phone: address.phone,
        },
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };
  const addBillingAddress = (address: ShippingAddress) => {
    updateCart.mutate(
      {
        billing_address: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          city: address.city,
          country_code: address.country_code,
          postal_code: address.postal_code,
          phone: address.phone,
        },
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };
  const addShippingAndBillingAddress = (
    address: ShippingAddress,
    address_2: ShippingAddress
  ) => {
    updateCart.mutate(
      {
        shipping_address: {
          first_name: address.first_name,
          last_name: address.last_name,
          address_1: address.address_1,
          city: address.city,
          country_code: address.country_code,
          postal_code: address.postal_code,
          phone: address.phone,
        },
        billing_address: {
          first_name: address_2.first_name,
          last_name: address_2.last_name,
          address_1: address_2.address_1,
          city: address_2.city,
          country_code: address_2.country_code,
          postal_code: address_2.postal_code,
          phone: address_2.phone,
        },
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };
  const deleteItem = (lineId: string) => {
    removeLineItem.mutate(
      {
        lineId,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };
  const updateEmail = (email: string) => {
    updateCart.mutate(
      {
        email,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
          timedOpen();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const updateItem = ({
    lineId,
    quantity,
  }: {
    lineId: string;
    quantity: number;
  }) => {
    adjustLineItem.mutate(
      {
        lineId,
        quantity,
      },
      {
        onSuccess: ({ cart }) => {
          setCart(cart);
          storeCart(cart.id);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  return (
    <StoreContext.Provider
      value={{
        countryCode,
        setRegion,
        addItem,
        deleteItem,
        updateItem,
        resetCart,
        cart,
        addShipping,
        addDiscount,
        updateEmail,
        addShippingAddress,
        addBillingAddress,
        addShippingAndBillingAddress,
        deleteDiscount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
