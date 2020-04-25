import { AdminUiExtension } from "@vendure/ui-devkit/compiler";

export { BulkDiscountPlugin } from "./plugin";

export const BulkDiscountsInputModule: AdminUiExtension["ngModules"][0] = {
  type: "shared",
  ngModuleFileName: "bulk-discount-input.module.ts",
  ngModuleName: "BulkDiscountInputModule",
};
