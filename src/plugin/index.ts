import { OrderItem, OrderLine } from "@vendure/common/lib/generated-types";
import {
  VendurePlugin,
  PluginCommonModule,
  PromotionCondition,
  LanguageCode,
  PromotionOrderAction,
  ID,
  PromotionItemAction,
  PromotionItemActionConfig,
  AdjustmentType,
} from "@vendure/core";
import {
  ConfigArgs,
  ConfigArgValues,
} from "@vendure/core/dist/common/configurable-operation";
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

interface BulkDiscountPromotionOrderActionConfig<T extends ConfigArgs>
  extends PromotionItemActionConfig<T> {
  bulkDiscountService: null | BulkDiscountService;
}

class BulkDiscountPromotionItemAction<
  T extends ConfigArgs = ConfigArgs
> extends PromotionItemAction<T> {
  constructor(config: BulkDiscountPromotionOrderActionConfig<T>) {
    super(config);
  }
}

const applyBulkDiscount = new BulkDiscountPromotionItemAction({
  bulkDiscountService: null,
  init: function (injector) {
    this.bulkDiscountService = injector.get(BulkDiscountService);
  },
  description: [
    {
      languageCode: LanguageCode.en,
      value: "Apply bulk discount configured in the product variants ",
    },
  ],
  code: "bulk-discount",
  args: {},
  execute: async function (ctx, orderItem, orderLine, args) {
    //@ts-ignore
    const bulkDiscountService: null | BulkDiscountService = this["options"]
      .bulkDiscountService;

    if (!bulkDiscountService) {
      throw new Error(
        "Object has already been destroyed or not created yet. Try again."
      );
    }

    const discounts = await bulkDiscountService.findByProductVariantId(
      orderLine.productVariant.id
    );
    const discount = discounts
      .sort((a, b) => b.quantity - a.quantity)
      .find((a) => a.quantity <= orderLine.quantity);

    //in the new vendure tax handling, this is now also multiplied by the taxrate.
    //since we want to actually set the price, we have to adjust for this
    //by dividing by the rate. (It will be multiplied by it again which cancels)

    //((round(priceWithTax / rate) + round(promotion)) * rate) * quantity
    //issue is the rounding here
    //what we want is discount.price
    //what is used when calculating is orderLine.unitPrice
    //we want discount.price = (unitPrice + round(promotion)) * rate
    //hence  discount.price/rate - unitPrice = round(promotion)

    return discount
      ? discount.price / (1.0 + orderLine.taxRate / 100) - orderLine.unitPrice
      : 0;
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
