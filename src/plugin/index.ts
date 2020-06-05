import {
  VendurePlugin,
  PluginCommonModule,
  PromotionCondition,
  LanguageCode,
  PromotionOrderAction,
  ID,
} from "@vendure/core";
import gql from "graphql-tag";
import { BulkDiscount } from "./bulk-discount.entity";
import {
  BulkDiscountAdminResolver,
  BulkDiscountShopResolver,
  BulkDiscountEntityResolver,
  ProductVariantEntityResolver,
} from "./bulk-discount.resolver";
import { BulkDiscountService } from "./bulk-discount.service";

export type BulkDiscountInput = {
  productVariantId: ID;
  discounts: { quantity: number; price: number }[];
};

const always = new PromotionCondition({
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Always",
    },
  ],
  code: "always",
  args: {},
  check(order, args) {
    return true;
  },
  priorityValue: 10,
});

const applyBulkDiscount = new PromotionOrderAction({
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Apply bulk discount configured elsewhere",
    },
  ],
  code: "bulk_discount",
  args: {},
  execute(order, args, { hasFacetValues }) {
    //TODO
    return 0;
  },
});

//extend product

const adminSchemaExtension = gql`
  type BulkDiscount {
    productVariant: ProductVariant!
    quantity: Int!
    price: Int!
  }

  input BulkDiscountInput {
    quantity: Int!
    price: Int!
  }

  extend type Query {
    productBulkDiscounts(productId: ID!): [BulkDiscount!]!
  }

  extend type Mutation {
    updateProductVariantBulkDiscounts(
      productVariantId: ID!
      discounts: [BulkDiscountInput!]!
    ): Boolean!
    updateProductVariantBulkDiscountsBySku(
      productVariantSku: String!
      discounts: [BulkDiscountInput!]!
    ): Boolean!
  }

  extend type ProductVariant {
    bulkDiscounts: [BulkDiscount!]!
  }
`;

const shopSchemaExtension = gql`
  type BulkDiscount {
    productVariant: ProductVariant!
    quantity: Int!
    price: Int!
  }
  extend type Query {
    productBulkDiscounts(productId: ID!): [BulkDiscount!]!
  }
  extend type ProductVariant {
    bulkDiscounts: [BulkDiscount!]!
  }
`;

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [BulkDiscount],
  providers: [BulkDiscountService],
  adminApiExtensions: {
    schema: adminSchemaExtension,
    resolvers: [
      BulkDiscountAdminResolver,
      BulkDiscountEntityResolver,
      ProductVariantEntityResolver,
    ],
  },
  shopApiExtensions: {
    schema: shopSchemaExtension,
    resolvers: [
      BulkDiscountShopResolver,
      BulkDiscountEntityResolver,
      ProductVariantEntityResolver,
    ],
  },
  configuration: (config) => {
    if (!config.promotionOptions.promotionActions) {
      config.promotionOptions.promotionActions = [];
    }

    if (!config.promotionOptions.promotionConditions) {
      config.promotionOptions.promotionConditions = [];
    }

    config.promotionOptions.promotionConditions.push(always);

    config.promotionOptions.promotionActions.push(applyBulkDiscount);

    config.customFields.ProductVariant.push({
      name: "bulkDiscountEnabled",
      type: "boolean",
      label: [{ languageCode: LanguageCode.en, value: "Has bulk discounts" }],
    });

    return config;
  },
})
export class BulkDiscountPlugin {}
