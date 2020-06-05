import { RequestContext, ID, ProductVariant, ProductVariantService } from "@vendure/core";
import { BulkDiscountService } from "./bulk-discount.service";
import { BulkDiscount } from "./bulk-discount.entity";
import { BulkDiscountInput } from ".";
import { Translated } from "@vendure/core/dist/common/types/locale-types";
export declare class BulkDiscountAdminResolver {
    private bulkDiscountService;
    constructor(bulkDiscountService: BulkDiscountService);
    updateProductVariantBulkDiscounts(ctx: RequestContext, args: {
        productVariantId: ID;
        discounts: BulkDiscountInput["discounts"];
    }): Promise<Boolean>;
    updateProductVariantBulkDiscountsBySku(ctx: RequestContext, args: {
        productVariantSku: string;
        discounts: BulkDiscountInput["discounts"];
    }): Promise<Boolean>;
    productBulkDiscounts(ctx: RequestContext, args: {
        productId: ID;
    }): Promise<BulkDiscount[]>;
}
export declare class BulkDiscountShopResolver {
    private bulkDiscountService;
    constructor(bulkDiscountService: BulkDiscountService);
    productBulkDiscounts(ctx: RequestContext, args: {
        productId: ID;
    }): Promise<BulkDiscount[]>;
}
export declare class BulkDiscountEntityResolver {
    private productVariantService;
    constructor(productVariantService: ProductVariantService);
    productVariant(ctx: RequestContext, bulkDiscount: BulkDiscount): Promise<Translated<ProductVariant>>;
}
export declare class ProductVariantEntityResolver {
    private bulkDiscountService;
    constructor(bulkDiscountService: BulkDiscountService);
    bulkDiscounts(ctx: RequestContext, productVariant: ProductVariant): Promise<BulkDiscount[]>;
}
