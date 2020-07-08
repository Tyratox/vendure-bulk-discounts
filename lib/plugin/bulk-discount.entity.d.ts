import { DeepPartial } from "@vendure/common/lib/shared-types";
import { VendureEntity, ID, ProductVariant } from "@vendure/core";
export declare class BulkDiscount extends VendureEntity {
    constructor(input?: DeepPartial<BulkDiscount>);
    id: number;
    productVariant: ProductVariant;
    productVariantId: ID;
    quantity: number;
    price: number;
}
