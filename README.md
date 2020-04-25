# About

The vendure-bulk-discounts plugin allows you to define different prices for product variants depending on the amount being purchased by clients. **Right now prices aren't reduced!** This plugin is mainly a preparation for when promotion actions have access to the database.

# Screenshot
![Screenshot](https://raw.githubusercontent.com/Tyratox/vendure-bulk-discounts/master/screenshot.png)

# Disclaimers

- I haven't worked with angular a lot, I'm sorry if some of my angular code looks more like react. Feel free to tell me what should be done differently.
- **There are no tests yet!**

# Installation

Step 1): Install `vendure-bulk-discounts` by using `npm` or `yarn`:

`yarn add vendure-bulk-discounts`

Step 2): Import the vendure plugin from `vendure-bulk-discounts` and add it the `plugins` section in

`vendure-config.ts`:
	
	import { BulkDiscountPlugin } from "vendure-bulk-discounts";
	...
	export const config: VendureConfig = {
	  ...
	  plugins: [
	    ...,
		BulkDiscountPlugin
	  ]
	}

Step 3): (optional) Import the ng module config from `vendure-bulk-discounts` and add it to the `AdminUiPlugin` extensions in:

`vendure-config.ts`:
    
    import { BulkDiscountPlugin, BulkDiscountsInputModule } from "vendure-bulk-discounts";
	...
	export const config: VendureConfig = {
	  ...
	  plugins: [
	    AdminUiPlugin.init({
		  app: compileUiExtensions({
		    ...,
			extensions: [
			  {
			    extensionPath: path.join(
				  __dirname,
				  "../node_modules/vendure-bulk-discounts/ui-extensions/modules/"
				),
				ngModules: [BulkDiscountsInputModule],
			  },
			]
		  })
		})
	  ]
	}

# Usage

The following graphql endpoints are added:

## Admin

	type BulkDiscount {
	  productVariant: ProductVariant!
	  quantity: Int!
	  price: Float!
	}
	
	input BulkDiscountInput {
	  quantity: Int!
	  price: Float!
	}
    
	extend type Query {
	  productBulkDiscounts(productId: ID!): [BulkDiscount!]!
	}
    
	extend type Mutation {
	  updateProductVariantBulkDiscounts(
	    productVariantId: ID!
	    discounts: [BulkDiscountInput!]!
	  ): Boolean!
	  updateProductVariantBulkDiscountsBySku(
	    productVariantSku: String!
        discounts: [BulkDiscountInput!]!
	  ): Boolean!
	}

## Shop

	type BulkDiscount {
	  productVariant: ProductVariant!
	  quantity: Int!
	  price: Float!
	}
	extend type Query {
	  productBulkDiscounts(productId: ID!): [BulkDiscount!]!
	}

# Known issues

- Right now this plugin only stores data, the ability to access the DB in promotion actions is [in development](https://github.com/vendure-ecommerce/vendure/issues/303).

## Code
- The integration in the admin ui is a little hacky, especially the retrieval of the product and variant id/sku

## UI
- Currently one is required to manually press the save button in addition to the save button for the product