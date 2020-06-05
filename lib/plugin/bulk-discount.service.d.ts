import { Connection } from "typeorm";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { ID } from "@vendure/core";
import { DeletionResponse } from "@vendure/common/lib/generated-types";
import { BulkDiscount } from "./bulk-discount.entity";
import { BulkDiscountInput } from "./index";
export declare class BulkDiscountService {
    private connection;
    constructor(connection: Connection);
    findAll(options: FindManyOptions<BulkDiscount> | undefined): Promise<BulkDiscount[]>;
    findByProductVariantSku(productVariantSku: string): Promise<BulkDiscount[]>;
    findByProductVariantId(productVariantId: ID): Promise<BulkDiscount[]>;
    findByProductId(productId: ID): Promise<BulkDiscount[]>;
    findProductVariantIdBySku(sku: string): Promise<ID>;
    findOne(recommendationId: ID): Promise<BulkDiscount | undefined>;
    create(input: BulkDiscountInput): Promise<BulkDiscount[]>;
    update(id: number, quantity: number, price: number): Promise<import("typeorm").UpdateResult>;
    delete(ids: ID[]): Promise<DeletionResponse>;
}
