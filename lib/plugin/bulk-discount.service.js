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
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const core_1 = require("@vendure/core");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const bulk_discount_entity_1 = require("./bulk-discount.entity");
let BulkDiscountService = class BulkDiscountService {
    constructor(connection) {
        this.connection = connection;
    }
    findAll(options) {
        return this.connection.getRepository(bulk_discount_entity_1.BulkDiscount).find(options);
    }
    findByProductVariantSku(productVariantSku) {
        return this.connection
            .getRepository(bulk_discount_entity_1.BulkDiscount)
            .createQueryBuilder("bulkDiscount")
            .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
            .where("productVariant.sku = :sku", { sku: productVariantSku })
            .getMany();
    }
    findByProductVariantId(productVariantId) {
        return this.connection
            .getRepository(bulk_discount_entity_1.BulkDiscount)
            .createQueryBuilder("bulkDiscount")
            .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
            .where("productVariant.id = :productVariantId", { productVariantId })
            .getMany();
    }
    findByProductId(productId) {
        return this.connection
            .getRepository(bulk_discount_entity_1.BulkDiscount)
            .createQueryBuilder("bulkDiscount")
            .leftJoinAndSelect("bulkDiscount.productVariant", "productVariant")
            .where("productVariant.productId = :productId", { productId })
            .getMany();
    }
    async findProductVariantIdBySku(sku) {
        return core_1.assertFound(this.connection.getRepository(core_1.ProductVariant).findOne({ where: { sku } })).then((v) => {
            return v.id;
        });
    }
    findOne(recommendationId) {
        return this.connection
            .getRepository(bulk_discount_entity_1.BulkDiscount)
            .findOne(recommendationId, { loadEagerRelations: true });
    }
    async create(input) {
        const discounts = [];
        for (const d of input.discounts) {
            const discount = new bulk_discount_entity_1.BulkDiscount({
                productVariant: await this.connection
                    .getRepository(core_1.Product)
                    .findOne(input.productVariantId),
                quantity: d.quantity,
                price: d.price,
            });
            discounts.push(core_1.assertFound(this.connection.getRepository(bulk_discount_entity_1.BulkDiscount).save(discount)));
        }
        return Promise.all(discounts);
    }
    async update(id, quantity, price) {
        return this.connection
            .getRepository(bulk_discount_entity_1.BulkDiscount)
            .update({ id }, { quantity, price });
    }
    async delete(ids) {
        try {
            await this.connection
                .createQueryBuilder()
                .delete()
                .from(bulk_discount_entity_1.BulkDiscount)
                .where({ id: typeorm_2.In(ids) })
                .execute();
            return {
                result: generated_types_1.DeletionResult.DELETED,
            };
        }
        catch (e) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
};
BulkDiscountService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectConnection()),
    __metadata("design:paramtypes", [typeorm_2.Connection])
], BulkDiscountService);
exports.BulkDiscountService = BulkDiscountService;
