import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection, In } from "typeorm";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { ID, assertFound, Product, ProductVariant } from "@vendure/core";
import {
  DeletionResponse,
  DeletionResult,
} from "@vendure/common/lib/generated-types";
import { BulkDiscount } from "./bulk-discount.entity";
import { BulkDiscountInput } from "./index";

@Injectable()
export class BulkDiscountService {
  constructor(@InjectConnection() private connection: Connection) {}

  findAll(
    options: FindManyOptions<BulkDiscount> | undefined
  ): Promise<BulkDiscount[]> {
    return this.connection.getRepository(BulkDiscount).find(options);
  }

  findByProductVariantSku(productVariantSku: string): Promise<BulkDiscount[]> {
    return this.connection
      .getRepository(BulkDiscount)
      .createQueryBuilder("bulkDiscount")
      .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
      .where("productVariant.sku = :sku", { sku: productVariantSku })
      .getMany();
  }

  findByProductVariantId(productVariantId: ID): Promise<BulkDiscount[]> {
    return this.connection
      .getRepository(BulkDiscount)
      .createQueryBuilder("bulkDiscount")
      .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
      .where("productVariant.id = :productVariantId", { productVariantId })
      .getMany();
  }

  findByProductId(productId: ID): Promise<BulkDiscount[]> {
    return this.connection
      .getRepository(BulkDiscount)
      .createQueryBuilder("bulkDiscount")
      .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
      .where("productVariant.productId = :productId", { productId })
      .getMany();
  }

  async findProductVariantIdBySku(sku: string): Promise<ID> {
    return assertFound(
      this.connection.getRepository(ProductVariant).findOne({ where: { sku } })
    ).then((v) => {
      return v.id;
    });
  }

  findOne(recommendationId: ID): Promise<BulkDiscount | undefined> {
    return this.connection
      .getRepository(BulkDiscount)
      .findOne(recommendationId, { loadEagerRelations: true });
  }

  async create(input: BulkDiscountInput): Promise<BulkDiscount[]> {
    const discounts = [];

    for (const d of input.discounts) {
      const discount = new BulkDiscount({
        productVariant: await this.connection
          .getRepository(ProductVariant)
          .findOne(input.productVariantId),
        quantity: d.quantity,
        price: d.price,
      });

      discounts.push(
        assertFound(this.connection.getRepository(BulkDiscount).save(discount))
      );
    }

    return Promise.all(discounts);
  }

  async update(id: number, quantity: number, price: number) {
    return this.connection
      .getRepository(BulkDiscount)
      .update({ id }, { quantity, price });
  }

  async delete(ids: ID[]): Promise<DeletionResponse> {
    try {
      await this.connection
        .createQueryBuilder()
        .delete()
        .from(BulkDiscount)
        .where({ id: In(ids) })
        .execute();

      return {
        result: DeletionResult.DELETED,
      };
    } catch (e) {
      return {
        result: DeletionResult.NOT_DELETED,
        message: e.toString(),
      };
    }
  }
}
