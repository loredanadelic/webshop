import { WidgetConfig } from "@medusajs/admin";
import { Order } from "@medusajs/medusa";
import Medusa from "@medusajs/medusa-js";
import Table from "../ui/table";
import React, { useState } from "react";
import { useAdminRegions } from "medusa-react";

import { VictoryBar, VictoryChart } from "victory";
const medusa = new Medusa({ baseUrl: "http://localhost:9000", maxRetries: 3 });
interface Dates {
  lte: Date;
  gt: Date;
}
const chartTheme = {
  axis: {
    style: {
      axis: {
        stroke: "#9E9E9E",
      },
      tickLabels: {
        fontSize: "10px",
        fill: "#9E9E9E",
        padding: 5,
      },
      grid: {
        strokeWidth: 0,
      },
    },
  },
};
const getCurrency = {
  eur: "€",
  usd: "$",
};
const OrdersWidget = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [dates, setDates] = React.useState<Dates>({
    lte: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
  });
  const [sourceData, setSourceData] = useState([]);
  const [details, setDetails] = useState(false);
  const { regions } = useAdminRegions();
  const countries = React.useMemo(() => {
    if (regions) {
      return regions.flatMap((region) => region?.countries);
    } else return [];
  }, [regions]);
  React.useEffect(() => {
    const fetchOrders = async () => {
      const ordersList = await medusa.admin.orders.list({
        created_at: {
          lte: dates.lte,
          gte: dates.gt,
        },
        offset: 0,
        limit: 100000,
      });
      setOrders(ordersList.orders);
      const start = new Date(dates.gt);
      const datesArray: Date[] = [];
      for (let i = 1; i <= 7; i++) {
        const currentDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        datesArray.push(currentDate);
      }

      let dateObject = {};
      datesArray.forEach((date) => {
        dateObject[date.toLocaleDateString()] = { quantity: 0, orders: [] };
      });
      ordersList.orders.forEach((order) => {
        if (
          dateObject[new Date(order.created_at).toLocaleDateString()] !==
          undefined && order.payment_status!=="canceled"
        ) {
          dateObject[
            new Date(order.created_at).toLocaleDateString()
          ].quantity += 1;
          dateObject[
            new Date(order.created_at).toLocaleDateString()
          ].orders.push(order);
        }
      });
      let keys = Object.keys(dateObject);
      const source = keys.map((key, i) => ({
        x: key,
        y: dateObject[key].quantity,
        key: i,
        orders: dateObject[key].orders,
      }));
      setSourceData(source);
    };

    fetchOrders();
  }, [dates.lte]);

  const ordersByCountry = React.useMemo(() => {
    let ordersMap = {};
    if (details) {
      orders.forEach((order) => {
        if (order.shipping_address?.country_code) {
          let total = 0;
          order.payments.forEach((payment) => (total += payment.amount));
          if (ordersMap[order.shipping_address.country_code]) {
            ordersMap[order.shipping_address.country_code].quantity += 1;
            ordersMap[order.shipping_address.country_code].total += total / 100;
          } else {
            ordersMap[order.shipping_address.country_code] = {
              quantity: 1,
              total: total / 100,
              currency_code: order.currency_code,
            };
          }
        }
      });
    }
    return ordersMap;
  }, [details]);
  const handleBack = React.useCallback(() => {
    setDates({
      lte: new Date(dates.lte.getTime() - 7 * 24 * 60 * 60 * 1000),
      gt: new Date(dates.gt.getTime() - 7 * 24 * 60 * 60 * 1000),
    });
  }, [dates.lte]);
  const handleForward = React.useCallback(() => {
    setDates({
      lte: new Date(dates.lte.getTime() + 7 * 24 * 60 * 60 * 1000),
      gt: new Date(dates.gt.getTime() + 7 * 24 * 60 * 60 * 1000),
    });
  }, [dates.lte]);
  if (sourceData && !details) {
    return (
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <div className="w-[70%] m-auto">
          <svg viewBox="0 0 400 300">
            <VictoryChart
              theme={chartTheme}
              domainPadding={{ x: [10, 30] }}
              standalone={false}
            >
              <VictoryBar
                data={sourceData}
                alignment="start"
                width={400}
                height={300}
                standalone={false}
                style={{
                  data: {
                    fill: ({ datum }) =>
                      (datum.key + 1) % 5 === 0
                        ? "#E879F9"
                        : (datum.key + 1) % 4 === 0
                        ? "#F472B6"
                        : (datum.key + 1) % 3 === 0
                        ? "#FB923C"
                        : (datum.key + 1) % 2 === 0
                        ? "#60A5FA"
                        : "#2DD4BF",
                  },
                  labels: {
                    color: "#808080",
                  },
                }}
                events={[
                  {
                    target: "data",
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            mutation: (props) => {
                              if (props.datum?.orders?.length > 0) {
                                setOrders(props.datum.orders as Order[]);
                                setDetails(true);
                              }
                            },
                          },
                        ];
                      },
                      onMouseOut: () => {
                        return [
                          {
                            mutation: (props) => {
                              return {
                                style: Object.assign({}, props.style, {
                                  fillOpacity: 1,
                                }),
                              };
                            },
                          },
                        ];
                      },
                      onMouseOver: () => {
                        return [
                          {
                            mutation: (props) => {
                              return {
                                style: Object.assign({}, props.style, {
                                  fillOpacity: 0.5,
                                }),
                              };
                            },
                          },
                        ];
                      },
                    },
                  },
                ]}
              />
            </VictoryChart>
          </svg>
        </div>
        <div className="flex justify-between w-[70%] m-auto">
          <button onClick={handleBack}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.75 10H16.875"
                stroke="#616161"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M8.125 5L3.125 10L8.125 15"
                stroke="#616161"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
          <button
            onClick={handleForward}
            disabled={
              new Date(dates.lte.getTime() + 1 * 24 * 60 * 60 * 1000) >
              new Date()
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33301 8H12.6663"
                stroke={
                  new Date(dates.lte.getTime() + 1 * 24 * 60 * 60 * 1000) >
                  new Date()
                    ? "#E0E0E0"
                    : "#616161"
                }
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M8 3.33331L12.6667 7.99998L8 12.6666"
                stroke={
                  new Date(dates.lte.getTime() + 1 * 24 * 60 * 60 * 1000) >
                  new Date()
                    ? "#E0E0E0"
                    : "#616161"
                }
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    );
  } else if (details) {
    return (
      <div className="bg-white p-8 border border-gray-200 rounded-lg">
        <button onClick={() => setDetails(false)} className="flex mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.75 10H16.875"
              stroke="#616161"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M8.125 5L3.125 10L8.125 15"
              stroke="#616161"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span className="pl-2 text-gray-700">Go Back</span>
        </button>

        <div>
          <h3 className="text-xl font-bold mb-4">
            {new Date(orders[0]?.created_at).toLocaleDateString()}
          </h3>
          <Table className="table-fixed">
            <Table.Head>
              <Table.HeadRow>
                <Table.HeadCell>Country</Table.HeadCell>
                <Table.HeadCell>Orders</Table.HeadCell>
                <Table.HeadCell>Total</Table.HeadCell>
              </Table.HeadRow>
            </Table.Head>
            <Table.Body>
              {Object.keys(ordersByCountry).map((country) => (
                <Table.Row>
                  <Table.Cell>
                    {countries.find((c) => c.iso_2 === country).display_name}
                  </Table.Cell>
                  <Table.Cell>{ordersByCountry[country].quantity}</Table.Cell>
                  <Table.Cell>
                    <span>
                      {getCurrency[ordersByCountry[country].currency_code]}
                      {ordersByCountry[country].total.toFixed(2)}
                    </span>
                    <span className="pl-2 text-gray-500">
                      {ordersByCountry[country].currency_code.toUpperCase()}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    );
  }
};

export const config: WidgetConfig = {
  zone: "order.list.after",
};

export default OrdersWidget;
