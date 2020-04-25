import { ID } from "@vendure/core";
export declare type BulkDiscountInput = {
    productVariantId: ID;
    discounts: {
        quantity: number;
        price: number;
    }[];
};
export declare class BulkDiscountPlugin {
}
