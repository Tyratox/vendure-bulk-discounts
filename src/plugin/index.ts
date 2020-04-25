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

const adminSchemaExtension = gql`
  type BulkDiscount {
    productVariant: ProductVariant!
    quantity: Int!
    price: Float!
  }

  input BulkDiscountInput {
    quantity: Int!
    price: Float!
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
`;

const shopSchemaExtension = gql`
  type BulkDiscount {
    productVariant: ProductVariant!
    quantity: Int!
    price: Float!
  }
  extend type Query {
    productBulkDiscounts(productId: ID!): [BulkDiscount!]!
  }
`;

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [BulkDiscount],
  providers: [BulkDiscountService],
  adminApiExtensions: {
    schema: adminSchemaExtension,
    resolvers: [BulkDiscountAdminResolver, BulkDiscountEntityResolver],
  },
  shopApiExtensions: {
    schema: shopSchemaExtension,
    resolvers: [BulkDiscountShopResolver, BulkDiscountEntityResolver],
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
