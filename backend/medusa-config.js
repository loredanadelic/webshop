const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "https://5bf4-93-140-226-29.ngrok-free.app,http://localhost:3000"
const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-store";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
 
   {
    resolve: "@medusajs/admin",
     options: {
       autoRebuild: true,
     },
   },
   {
    resolve: `medusa-plugin-slack-notification`,
    options: {
      show_discount_code: false,
      slack_url: `https://hooks.slack.com/services/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`,
      admin_orders_url: `http://localhost:7001/a/orders`,
    },},
    {
      resolve: "medusa-plugin-algolia",
      options: {
        applicationId: process.env.ALGOLIA_APP_ID,
        adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ["title"],
              attributesToRetrieve: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "options",
                "variants",
                "created_at"
              ],
            },
            transformer: (product) => {
              return ({
              objectID: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
              handle: product.handle,
              created_at: product.created_at,
              variants: product.variants.map((v) => ({
                title: v.title,
                prices: v.prices.map((price) => ({
                  amount: price.amount,
                  currency_code: price.currency_code
                }))
              }))
              })
            },
          },
        },
      },
    },
    {
      resolve: `medusa-payment-stripe`,
      options: {
        api_key: process.env.STRIPE_API_KEY,
        automatic_payment_methods: true,
        capture: true
      },
    },
  
];

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-local",
  },
  /*eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },*/
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
};
