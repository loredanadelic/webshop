import { EventBusService, OrderService } from "@medusajs/medusa";
import { WebClient } from "@slack/web-api";
const web = new WebClient(process.env.BOT_TOKEN);

type InjectedDependencies = {
  eventBusService: EventBusService;
  slackService: any;
  orderService: OrderService;
};

class OrderConfirmationSubscriber {
  protected slackService_: any;
  protected readonly orderService_: OrderService;

  constructor({
    eventBusService,
    orderService,
    slackService,
  }: InjectedDependencies) {
    this.slackService_ = slackService;
    this.orderService_ = orderService;
    eventBusService.subscribe("order.placed", this.handleOrderConfirmation);
  }

  handleOrderConfirmation = async (data: Record<string, any>) => {
    const order = await this.orderService_.retrieve(data.id, {
      select: [
        "shipping_total",
        "discount_total",
        "tax_total",
        "subtotal",
        "total",
      ],
      relations: [
        "customer",
        "billing_address",
        "shipping_address",
        "discounts",
        "discounts.rule",
        "shipping_methods",
        "payments",
        "items",
      ],
    });

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ` :tada:\tOrder *<http://localhost:3000/my-account/orders/${order.display_id}|#${
            order.display_id
          }>* \t:tada:`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Customer \t :bust_in_silhouette:*\nFirst Name: \t${order.shipping_address?.first_name} \nLast Name: \t${order.shipping_address?.last_name}\nEmail: \t${order.email}\n*Shipping Address \t :package:*\nAddress: \t${order.shipping_address?.address_1}\nCity: \t${order.shipping_address?.city}\nCountry: \t:flag-${order.shipping_address?.country_code}:`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:credit_card:  \n*Subtotal: *\t${(
            order.subtotal / 100
          ).toFixed(2)} ${order.currency_code}\n*Shipping: *\t${(
            order.shipping_total / 100
          ).toFixed(2)} ${order.currency_code}\n*Discount Total: *\t${(
            order.discount_total / 100
          ).toFixed(2)} ${order.currency_code}\n*Tax: *\t${(
            order.tax_total / 100
          ).toFixed(2)} ${order.currency_code}\n*Total: *\t${(
            order.total / 100
          ).toFixed(2)} ${order.currency_code}`,
        },
      },
      {
        type: "divider",
      },
    ];

    for (const item of order.items) {
      const line = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<http://localhost:3000/product/${item.variant.product_id}|#${
            item.title
          }>*\n Quantity: \t${item.quantity} \n Total: \t${(
            item.total / 100
          ).toFixed(2)} ${order.currency_code}`,
        },
        accessory: {
          type: "image",
          image_url: `${item.thumbnail?.replace(
            "http://localhost:9000",
            "https://90cc-93-143-52-59.ngrok.io"
          )}`,
          alt_text: "Product image",
        },
      };
      blocks.push(line);
      blocks.push({
        type: "divider",
      });
    }

    await web.chat.postMessage({
      blocks,
      channel: "C05RKCHL46L",
    });
  };
}

export default OrderConfirmationSubscriber;
