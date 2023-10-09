import { uniqBy } from "lodash";
import { BaseService } from "medusa-interfaces";
import stripe, { Stripe } from "stripe";

class StripeCustomerService extends BaseService {
  protected stripe: Stripe;

  constructor() {
    super();

    this.stripe = new stripe(
      "sk_test_51NrxbVCm87XVwA85VTeeFZ2gi1YZt6eq4bMVDchLwWmSz3dtl5eTXX4trQ2bUFVpxB8JrJushtrZeYIhUwuvVrnu00pMZepHwS",
      {
        apiVersion: "2023-08-16",
      }
    );
  }

  async retrieveCustomerPaymentMethods(
    paymentMethodIds: string[]
  ) {
    const paymentMethods = [];
    for (const paymentMethodId of paymentMethodIds) {
      const response = await this.stripe.paymentMethods.retrieve(
        paymentMethodId
      );
      if (response.id && response.card) {
        paymentMethods.push({
          last4: response.card.last4,
          first_name: response.billing_details.name,
          exp: response.card.exp_month + "/" + response.card.exp_year,
          brand: response.card.brand
        });
      }
    }
    const uniquePaymentMethods = uniqBy(paymentMethods, "last4");
  

    return uniquePaymentMethods;
  }
}

export default StripeCustomerService;
