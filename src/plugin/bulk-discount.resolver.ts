import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import {
  Allow,
  Ctx,
  RequestContext,
  ID,
  ProductService,
  Product,
  ProductVariant,
  ProductVariantService,
} from "@vendure/core";
import { Permission } from "@vendure/common/lib/generated-types";

import { BulkDiscountService } from "./bulk-discount.service";
import { BulkDiscount } from "./bulk-discount.entity";
import { BulkDiscountInput } from ".";
import { Translated } from "@vendure/core/dist/common/types/locale-types";

@Resolver()
export class BulkDiscountAdminResolver {
  constructor(
    private bulkDiscountService: BulkDiscountService,
    private productVariantService: ProductVariantService
  ) {}

  @Mutation()
  @Allow(Permission.UpdateCatalog)
  async updateProductVariantBulkDiscounts(
    @Ctx() ctx: RequestContext,
    @Args()
    args: {
      productVariantId: ID;
      discounts: BulkDiscountInput["discounts"];
    }
  ): Promise<Boolean> {
    const discounts = await this.bulkDiscountService.findAll({
      where: { productVariant: args.productVariantId },
    });

    if (discounts.length < args.discounts.length) {
      this.bulkDiscountService.create({
        productVariantId: args.productVariantId,
        discounts: args.discounts.slice(
          discounts.length,
          args.discounts.length
        ),
      });
    } else if (args.discounts.length < discounts.length) {
      this.bulkDiscountService.delete(
        discounts
          .slice(args.discounts.length, discounts.length)
          .map((d) => d.id)
      );
    }

    const updates = [];

    for (let i = 0; i < args.discounts.length; i++) {
      updates.push(
        this.bulkDiscountService.update(
          discounts[i].id,
          args.discounts[i].quantity,
          args.discounts[i].price
        )
      );
    }

    await Promise.all(updates);

    return true;
  }

  @Mutation()
  @Allow(Permission.UpdateCatalog)
  async updateProductVariantBulkDiscountsBySku(
    @Ctx() ctx: RequestContext,
    @Args()
    args: {
      productVariantSku: string;
      discounts: BulkDiscountInput["discounts"];
    }
  ): Promise<Boolean> {
    const productVariantId = await this.bulkDiscountService.findProductVariantIdBySku(
      args.productVariantSku
    );

    let discounts = await this.bulkDiscountService.findAll({
      where: { productVariant: productVariantId },
    });

    if (discounts.length < args.discounts.length) {
      discounts = discounts.concat(
        await this.bulkDiscountService.create({
          productVariantId: productVariantId,
          discounts: args.discounts.slice(
            discounts.length,
            args.discounts.length
          ),
        })
      );
    } else if (args.discounts.length < discounts.length) {
      await this.bulkDiscountService.delete(
        discounts
          .slice(args.discounts.length, discounts.length)
          .map((d) => d.id)
      );
      //won't be accessed below so don't delete them from 'discounts'
    }

    const updates = [];

    for (let i = 0; i < args.discounts.length; i++) {
      updates.push(
        this.bulkDiscountService.update(
          discounts[i].id,
          args.discounts[i].quantity,
          args.discounts[i].price
        )
      );
    }

    await Promise.all(updates);

    return true;
  }

  @Query()
  async productBulkDiscounts(
    @Ctx() ctx: RequestContext,
    @Args() args: { productId: ID }
  ): Promise<BulkDiscount[]> {
    return await this.bulkDiscountService.findByProductId(args.productId);
  }
}

@Resolver()
export class BulkDiscountShopResolver {
  constructor(private bulkDiscountService: BulkDiscountService) {}

  @Query()
  async productBulkDiscounts(
    @Ctx() ctx: RequestContext,
    @Args() args: { productId: ID }
  ): Promise<BulkDiscount[]> {
    return await this.bulkDiscountService.findByProductId(args.productId);
  }
}

@Resolver("BulkDiscount")
export class BulkDiscountEntityResolver {
  constructor(private productVariantService: ProductVariantService) {}

  @ResolveField()
  async productVariant(
    @Ctx() ctx: RequestContext,
    @Parent() bulkDiscount: BulkDiscount
  ): Promise<Translated<ProductVariant>> {
    const productVariant = await this.productVariantService.findOne(
      ctx,
      bulkDiscount.productVariant.id
    );

    if (!productVariant) {
      throw new Error(
        `Invalid database records for bulk discount with the id ${bulkDiscount.id}`
      );
    }

    return productVariant;
  }
}
