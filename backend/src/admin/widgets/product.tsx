import type { WidgetConfig } from "@medusajs/admin";
import React from "react";
import { PricedVariant } from "@medusajs/medusa/dist/types/pricing";
import axios from "axios";
import { VictoryLabel, VictoryPie } from "victory";
import Table from "../ui/table";

const ProductWidget = ({ product }) => {
  const productVariants = React.useMemo(
    () => product?.variants?.map((variant: PricedVariant) => variant.id),
    [product.id]
  );
  const inventoryQuantity = React.useMemo(() => {
    const inventory = product?.variants?.map(
      (variant: PricedVariant) => variant.inventory_quantity
    ) as number[];
    const sum = inventory.reduce((prev, curr) => prev + curr, 0);
    return sum;
  }, [product.id]);

  const [atributes, setAtributes] = React.useState({
    quantity: 0,
    method: {},
  });
  const [percentage, setPercentage] = React.useState<number>(0);
  React.useEffect(() => {
    const fetch = async () => {
      const result = await axios.post(
        "http://localhost:9000/admin/line_items",
        {
          variants: productVariants,
        }
      );
      if (result.data) {
        setAtributes({
          quantity: result.data.quantity,
          method: result.data.method,
        });
        setPercentage(
          () =>
            (result.data.quantity /
              (result.data.quantity + inventoryQuantity)) *
            100
        );
      }
    };
    fetch();
  }, [productVariants]);
  return (
    <div className="bg-white p-8 border border-gray-200 rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Analytics</h3>
      <div>
        <div className="flex justify-between align-middle  mb-large">
          <div className=" gap-y-xsmall flex flex-col w-20 m-auto ml-0">
            <p className="font-bold">Sold</p>
            <p className="text-gray-500">{atributes.quantity} items</p>
          </div>
          <div className="w-20">
            <svg viewBox="0 0 400 400">
              <VictoryPie
                labelComponent={<span />}
                standalone={false}
                innerRadius={95}
                labelRadius={100}
                width={400}
                height={400}
                data={[
                  {
                    key: "",
                    y: percentage,
                  },
                  {
                    key: "",
                    y: 100 - percentage,
                  },
                ]}
                colorScale={["#0A7E8C", "#EEEEEE"]}
              />
              <VictoryLabel
                textAnchor="middle"
                style={{ fontSize: 60, color: "rgb(107 114 128)" }}
                x={200}
                y={200}
                text={percentage.toFixed() + "%"}
              />
            </svg>
          </div>
        </div>
        <div className="gap-y-xsmall flex flex-col">
          <p className="font-bold">Earnings </p>
          <div>
            <Table>
              <Table.Head>
                <Table.HeadRow>
                  <Table.HeadCell>Payment method</Table.HeadCell>
                  <Table.HeadCell>Currency</Table.HeadCell>
                  <Table.HeadCell>Number of orders</Table.HeadCell>
                  <Table.HeadCell>Earnings</Table.HeadCell>
                </Table.HeadRow>
              </Table.Head>
              <Table.Body>
                {Object.keys(atributes.method).map((key) => {
                  return Object.keys(atributes.method[key]).map((value) => (
                    <Table.Row>
                      <Table.Cell>{key.toUpperCase()}</Table.Cell>
                      <Table.Cell>{value.toUpperCase()}</Table.Cell>
                      <Table.Cell>
                        {atributes.method[key][value].orders}
                      </Table.Cell>
                      <Table.Cell>
                        {(atributes.method[key][value].earnings / 100).toFixed(
                          2
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ));
                })}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const config: WidgetConfig = {
  zone: "product.details.after",
};

export default ProductWidget;
