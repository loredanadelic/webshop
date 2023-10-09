import express, { Router } from "express";
import { getConfigFile, parseCorsOrigins } from "medusa-core-utils";
import { ConfigModule } from "@medusajs/medusa/dist/types/global";
import cors from "cors";
import { LineItemService, OrderService } from "@medusajs/medusa";
import StripeCustomerService from "services/stripe-customer";

export default (rootDirectory) => {
  const router = Router();

  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;
  const storeCorsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  const storeRouter = Router();
  router.use("/store", storeRouter);
  storeRouter.use(cors(storeCorsOptions));

  storeRouter.post(
    "/stripe-customer/:id",
    cors(storeCorsOptions),
    async (req, res) => {
      const stripeCustomerService: StripeCustomerService = req.scope.resolve(
        "stripeCustomerService"
      );
      const payment_method_ids = req.body.paymentMethodIds;
      const result = await stripeCustomerService.retrieveCustomerPaymentMethods(
        payment_method_ids
      );
      res.json(result);
    }
  );
  storeRouter.get(
    "/order_confirmation/:id",
    cors(storeCorsOptions),
    async (req, res) => {
      const orderService: OrderService = req.scope.resolve("orderService");
      const orderId = req.params.id;

      const result = await orderService.retrieve(orderId, {
        relations: ["billing_address", "shipping_address", "payments"],
      });
      const paymentMethod =
        result.payments[0].provider_id === "stripe" ? "card" : "cash";
      let paymentMethodIds;
      let payment;
      const stripeCustomerService: StripeCustomerService = req.scope.resolve(
        "stripeCustomerService"
      );
      if (paymentMethod === "card") {
        paymentMethodIds = result.payments[0].data.payment_method;
        payment = await stripeCustomerService.retrieveCustomerPaymentMethods([
          paymentMethodIds,
        ]);
      } else {
        payment = undefined;
      }
      res.json({
        billing_address: result.billing_address,
        shipping_address: result.shipping_address,
        payment: paymentMethod,
        card: payment,
        display_id: result.display_id,
      });
    }
  );
  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  router.use(cors(corsOptions));
  const adminRouter = Router();
  router.use("/admin", adminRouter);

  adminRouter.post("/line_items", async (req, res) => {
    const lineItemService: LineItemService =
      req.scope.resolve("lineItemService");
    const orderService: OrderService = req.scope.resolve("orderService");
    const variantIds: string[] = req.body.variants;
    let quantity = 0;
    let method = {
      stripe: {
        eur: { orders: 0, earnings: 0 },
        usd: { orders: 0, earnings: 0 },
      },
      manual: {
        eur: { orders: 0, earnings: 0 },
        usd: { orders: 0, earnings: 0 },
      },
    };

    for (const id of variantIds) {
      const result = await lineItemService.list({ variant_id: id });
      for (const item of result) {
        if (item.order_id) {
          const order = await orderService.retrieve(item.order_id, {
            relations: ["payments"],
          });
          quantity += item.quantity;
          method = {
            ...method,
            [order.payments[0].provider_id]: {
              ...method[order.payments[0].provider_id],

              [order.currency_code]: {
                orders:
                  method[order.payments[0].provider_id][order.currency_code]
                    .orders + 1,
                earnings:
                  method[order.payments[0].provider_id][order.currency_code]
                    .earnings + item.unit_price,
              },
            },
          };
        }
      }
    }

    res.json({ quantity: quantity, method: method });
  });

  return router;
};
