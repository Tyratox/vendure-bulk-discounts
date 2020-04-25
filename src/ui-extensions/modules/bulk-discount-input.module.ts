import {
  NgModule,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { notify } from "@vendure/ui-devkit";
import { FormControl } from "@angular/forms";
import {
  SharedModule,
  CustomFieldControl,
  CustomFieldConfigType,
  registerCustomFieldComponent,
  DataService,
} from "@vendure/admin-ui/core";
import { ActivatedRoute } from "@angular/router";
import { ID } from "@vendure/core";
import { parse } from "graphql";

@Component({
  template: `
    <input type="checkbox" [formControl]="formControl" />
    <div *ngIf="formControl.value">
      <table class="table">
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let discount of discounts; let i = index">
            <td>
              <input
                type="number"
                value="{{ discount.quantity }}"
                (input)="onQuantityChange(i, $event.target.value)"
              />
            </td>
            <td>
              <input
                type="number"
                value="{{ discount.price }}"
                (input)="onPriceChange(i, $event.target.value)"
              />
            </td>
            <td>
              <button class="btn btn-danger" (click)="removeEntry(i)">x</button>
            </td>
          </tr>
          <tr>
            <td><input style="visibility:hidden;" /></td>
            <td><input style="visibility:hidden;" /></td>
            <td>
              <button class="btn btn-secondary" (click)="newEntry()">
                New entry
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <button class="btn btn-primary" (click)="saveBulkDiscounts()">
        Save
      </button>
      <br /><br />
    </div>
  `,
})
export class BulkDiscountControl
  implements CustomFieldControl, OnInit, OnDestroy {
  customFieldConfig: CustomFieldConfigType;
  formControl: FormControl;

  productId: ID | null;
  productVariantSku: string;

  discounts: { quantity: number; price: number }[];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    this.discounts = [];
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      this.productId = paramMap.get("id");
      //https://github.com/microsoft/TypeScript/issues/19335
      this.productVariantSku = this.formControl["_parent"]["_parent"].value.sku;

      if (this.productId) {
        this.dataService
          .query<
            {
              productBulkDiscounts: {
                productVariant: {
                  sku: string;
                };
                quantity: number;
                price: number;
              }[];
            },
            { productId: ID }
          >(
            parse(
              `query BulkDiscounts($productId: ID!){
                productBulkDiscounts(productId: $productId){
                  productVariant{
                    sku
                  }
                  quantity
                  price
                }
              }`
            ),
            { productId: this.productId }
          )
          .single$.toPromise()
          .then((response) => {
            this.discounts = response.productBulkDiscounts
              .filter((d) => d.productVariant.sku === this.productVariantSku)
              .map((d) => ({ quantity: d.quantity, price: d.price }));
            this.cdr.detectChanges();
          })
          .catch((e) => {
            notify({
              message: "Bulk discounts couldn't be fetched. Check the console.",
              type: "error",
            });
            console.error(e);
          });
      }
    });
  }

  ngOnDestroy() {}

  onQuantityChange(index: number, value: string) {
    if (value) {
      this.discounts[index].quantity = parseInt(value);
    }
  }
  onPriceChange(index: number, value: string) {
    if (value && !value.endsWith(".")) {
      this.discounts[index].price = parseFloat(value);
    }
  }

  removeEntry(index: number) {
    this.discounts.splice(index, 1);
  }

  newEntry() {
    this.discounts.push({ quantity: 0, price: 0 });
  }

  saveBulkDiscounts() {
    if (this.productId) {
      this.dataService
        .mutate<
          {
            updateProductBulkDiscount: boolean;
          },
          {
            productVariantSku: ID;
            discounts: { quantity: number; price: number }[];
          }
        >(
          parse(
            `mutation updateProductVariantBulkDiscountsBySku($productVariantSku: String!, $discounts: [BulkDiscountInput!]!) {
              updateProductVariantBulkDiscountsBySku(productVariantSku: $productVariantSku, discounts: $discounts)
            }`
          ),
          {
            productVariantSku: this.productVariantSku,
            discounts: this.discounts,
          }
        )
        .toPromise()
        .then(() =>
          notify({
            message: "Product recommendations updated successfully",
            type: "success",
          })
        )
        .catch((e) => {
          notify({
            message:
              "Product recommendations couldn't be updated. Check the console.",
            type: "error",
          });
          console.error(e);
        });
    }
  }
}

@NgModule({
  imports: [SharedModule],
  declarations: [BulkDiscountControl],
  providers: [
    registerCustomFieldComponent(
      "ProductVariant",
      "bulkDiscountEnabled",
      BulkDiscountControl
    ),
  ],
})
export class BulkDiscountInputModule {}
