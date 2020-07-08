import { DeepPartial } from "@vendure/common/lib/shared-types";
import { VendureEntity, ID, ProductVariant } from "@vendure/core";
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";

@Entity()
export class BulkDiscount extends VendureEntity {
  constructor(input?: DeepPartial<BulkDiscount>) {
    super(input);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => ProductVariant, {
    onDelete: "CASCADE",
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  productVariant: ProductVariant;

  @RelationId((item: BulkDiscount) => item.productVariant)
  productVariantId: ID;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "int" })
  price: number;
}
