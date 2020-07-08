"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const bulk_discount_service_1 = require("./bulk-discount.service");
const bulk_discount_entity_1 = require("./bulk-discount.entity");
let BulkDiscountAdminResolver = class BulkDiscountAdminResolver {
    constructor(bulkDiscountService) {
        this.bulkDiscountService = bulkDiscountService;
    }
    async updateProductVariantBulkDiscounts(ctx, args) {
        const discounts = await this.bulkDiscountService.findAll({
            where: { productVariant: args.productVariantId },
        });
        if (discounts.length < args.discounts.length) {
            this.bulkDiscountService.create({
                productVariantId: args.productVariantId,
                discounts: args.discounts.slice(discounts.length, args.discounts.length),
            });
        }
        else if (args.discounts.length < discounts.length) {
            this.bulkDiscountService.delete(discounts
                .slice(args.discounts.length, discounts.length)
                .map((d) => d.id));
        }
        const updates = [];
        for (let i = 0; i < discounts.length; i++) {
            updates.push(this.bulkDiscountService.update(discounts[i].id, args.discounts[i].quantity, args.discounts[i].price));
        }
        await Promise.all(updates);
        return true;
    }
    async updateProductVariantBulkDiscountsBySku(ctx, args) {
        const productVariantId = await this.bulkDiscountService.findProductVariantIdBySku(args.productVariantSku);
        let discounts = await this.bulkDiscountService.findAll({
            where: { productVariant: productVariantId },
        });
        if (discounts.length < args.discounts.length) {
            discounts = discounts.concat(await this.bulkDiscountService.create({
                productVariantId: productVariantId,
                discounts: args.discounts.slice(discounts.length, args.discounts.length),
            }));
        }
        else if (args.discounts.length < discounts.length) {
            await this.bulkDiscountService.delete(discounts
                .slice(args.discounts.length, discounts.length)
                .map((d) => d.id));
            //won't be accessed below so don't delete them from 'discounts'
        }
        const updates = [];
        for (let i = 0; i < discounts.length; i++) {
            updates.push(this.bulkDiscountService.update(discounts[i].id, args.discounts[i].quantity, args.discounts[i].price));
        }
        await Promise.all(updates);
        return true;
    }
    async productBulkDiscounts(ctx, args) {
        return await this.bulkDiscountService.findByProductId(args.productId);
    }
};
__decorate([
    graphql_1.Mutation(),
    core_1.Allow(generated_types_1.Permission.UpdateCatalog),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], BulkDiscountAdminResolver.prototype, "updateProductVariantBulkDiscounts", null);
__decorate([
    graphql_1.Mutation(),
    core_1.Allow(generated_types_1.Permission.UpdateCatalog),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], BulkDiscountAdminResolver.prototype, "updateProductVariantBulkDiscountsBySku", null);
__decorate([
    graphql_1.Query(),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], BulkDiscountAdminResolver.prototype, "productBulkDiscounts", null);
BulkDiscountAdminResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [bulk_discount_service_1.BulkDiscountService])
], BulkDiscountAdminResolver);
exports.BulkDiscountAdminResolver = BulkDiscountAdminResolver;
let BulkDiscountShopResolver = class BulkDiscountShopResolver {
    constructor(bulkDiscountService) {
        this.bulkDiscountService = bulkDiscountService;
    }
    async productBulkDiscounts(ctx, args) {
        return await this.bulkDiscountService.findByProductId(args.productId);
    }
};
__decorate([
    graphql_1.Query(),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], BulkDiscountShopResolver.prototype, "productBulkDiscounts", null);
BulkDiscountShopResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [bulk_discount_service_1.BulkDiscountService])
], BulkDiscountShopResolver);
exports.BulkDiscountShopResolver = BulkDiscountShopResolver;
let BulkDiscountEntityResolver = class BulkDiscountEntityResolver {
    constructor(productVariantService) {
        this.productVariantService = productVariantService;
    }
    async productVariant(ctx, bulkDiscount) {
        const productVariant = await this.productVariantService.findOne(ctx, bulkDiscount.productVariant.id);
        if (!productVariant) {
            throw new Error(`Invalid database records for bulk discount with the id ${bulkDiscount.id}`);
        }
        return productVariant;
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext,
        bulk_discount_entity_1.BulkDiscount]),
    __metadata("design:returntype", Promise)
], BulkDiscountEntityResolver.prototype, "productVariant", null);
BulkDiscountEntityResolver = __decorate([
    graphql_1.Resolver("BulkDiscount"),
    __metadata("design:paramtypes", [core_1.ProductVariantService])
], BulkDiscountEntityResolver);
exports.BulkDiscountEntityResolver = BulkDiscountEntityResolver;
let ProductVariantEntityResolver = class ProductVariantEntityResolver {
    constructor(bulkDiscountService) {
        this.bulkDiscountService = bulkDiscountService;
    }
    async bulkDiscounts(ctx, productVariant) {
        return this.bulkDiscountService.findByProductVariantId(productVariant.id);
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, core_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext,
        core_1.ProductVariant]),
    __metadata("design:returntype", Promise)
], ProductVariantEntityResolver.prototype, "bulkDiscounts", null);
ProductVariantEntityResolver = __decorate([
    graphql_1.Resolver("ProductVariant"),
    __metadata("design:paramtypes", [bulk_discount_service_1.BulkDiscountService])
], ProductVariantEntityResolver);
exports.ProductVariantEntityResolver = ProductVariantEntityResolver;
