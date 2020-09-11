"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@vendure/core");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const bulk_discount_entity_1 = require("./bulk-discount.entity");
const bulk_discount_resolver_1 = require("./bulk-discount.resolver");
const bulk_discount_service_1 = require("./bulk-discount.service");
const always = new core_1.PromotionCondition({
    description: [
        {
            languageCode: core_1.LanguageCode.en,
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
class BulkDiscountPromotionItemAction extends core_1.PromotionItemAction {
    constructor(config) {
        super(config);
    }
}
const applyBulkDiscount = new BulkDiscountPromotionItemAction({
    bulkDiscountService: null,
    init: function (injector) {
        this.bulkDiscountService = injector.get(bulk_discount_service_1.BulkDiscountService);
    },
    description: [
        {
            languageCode: core_1.LanguageCode.en,
            value: "Apply bulk discount configured in the product variants ",
        },
    ],
    code: "bulk-discount",
    args: {},
    execute: async function (orderItem, orderLine, args) {
        //@ts-ignore
        const bulkDiscountService = this["options"]
            .bulkDiscountService;
        if (!bulkDiscountService) {
            throw new Error("Object has already been destroyed or not created yet. Try again.");
        }
        const discounts = await bulkDiscountService.findByProductVariantId(orderLine.productVariant.id);
        const discount = discounts
            .sort((a, b) => b.quantity - a.quantity)
            .find((a) => a.quantity <= orderLine.quantity);
        return discount ? discount.price - orderLine.unitPriceWithTax : 0;
    },
});
//extend product
const adminSchemaExtension = graphql_tag_1.default `
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
const shopSchemaExtension = graphql_tag_1.default `
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
let BulkDiscountPlugin = class BulkDiscountPlugin {
};
BulkDiscountPlugin = __decorate([
    core_1.VendurePlugin({
        imports: [core_1.PluginCommonModule],
        entities: [bulk_discount_entity_1.BulkDiscount],
        providers: [bulk_discount_service_1.BulkDiscountService],
        adminApiExtensions: {
            schema: adminSchemaExtension,
            resolvers: [
                bulk_discount_resolver_1.BulkDiscountAdminResolver,
                bulk_discount_resolver_1.BulkDiscountEntityResolver,
                bulk_discount_resolver_1.ProductVariantEntityResolver,
            ],
        },
        shopApiExtensions: {
            schema: shopSchemaExtension,
            resolvers: [
                bulk_discount_resolver_1.BulkDiscountShopResolver,
                bulk_discount_resolver_1.BulkDiscountEntityResolver,
                bulk_discount_resolver_1.ProductVariantEntityResolver,
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
                label: [{ languageCode: core_1.LanguageCode.en, value: "Has bulk discounts" }],
            });
            return config;
        },
    })
], BulkDiscountPlugin);
exports.BulkDiscountPlugin = BulkDiscountPlugin;
