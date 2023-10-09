import { EventBusService, OrderService } from "@medusajs/medusa";
import searchInsights from "search-insights";

type InjectedDependencies = {
  eventBusService: EventBusService;
  orderService: OrderService;
};

class AlgoliaRecommendSubscriber {
  protected readonly orderService_: OrderService;
  constructor({ eventBusService, orderService }: InjectedDependencies) {
    this.orderService_ = orderService;
    eventBusService.subscribe("order.placed", this.handleOrderConfirmation);
  }

  handleOrderConfirmation = async (data: Record<string, any>) => {
    searchInsights("init", {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_ADMIN_API_KEY,
    });
    const order = await this.orderService_.retrieve(data.id, {
      relations: ["customer", "items", "items.variant"],
    });

    searchInsights("convertedObjectIDs", {
      index: "products",
      userToken: order.customer_id,
      eventName: "Order",
      objectIDs: order.items.map((i) => i.variant.product_id),
    });
  };
}

export default AlgoliaRecommendSubscriber;
