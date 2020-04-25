import { DeepPartial } from "@vendure/common/lib/shared-types";
import { VendureEntity, ProductVariant } from "@vendure/core";
export declare class BulkDiscount extends VendureEntity {
    constructor(input?: DeepPartial<BulkDiscount>);
    id: number;
    productVariant: ProductVariant;
    quantity: number;
    price: number;
}
