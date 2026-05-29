import { pgTable, text, timestamp, doublePrecision, jsonb, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role').notNull(), // 'user', 'admin', 'designer'
  shopName: text('shop_name'),
  resetToken: text('reset_token'),
  resetExpires: timestamp('reset_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const designers = pgTable('designers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  heroImage: text('hero_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shops = pgTable('shops', {
  id: uuid('id').defaultRandom().primaryKey(),
  designerId: uuid('designer_id').references(() => designers.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // the shop name for URL
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const designerDesigns = pgTable('designer_designs', {
  id: uuid('id').defaultRandom().primaryKey(),
  designerId: uuid('designer_id').references(() => designers.id).notNull(),
  shopId: uuid('shop_id').references(() => shops.id).notNull(),
  name: text('name').notNull(),
  productId: text('product_id').notNull(), // t-shirt, hoodie, etc.
  preview: text('preview').notNull(), // data URL or URL
  designData: jsonb('design_data').notNull(),
  isFeatured: text('is_featured').default('false').notNull(), // 'true' or 'false'
  isEditorsPick: text('is_editors_pick').default('false').notNull(), // 'true' or 'false'
  isExclusive: text('is_exclusive').default('false').notNull(),
  isSpringCollection: text('is_spring_collection').default('false').notNull(),
  isMinimalist: text('is_minimalist').default('false').notNull(),
  isFlashSale: text('is_flash_sale').default('false').notNull(),
  price: doublePrecision('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  depositAmount: doublePrecision('deposit_amount').notNull(),
  balanceAmount: doublePrecision('balance_amount').notNull(),
  status: text('status').default('pending').notNull(),
  paymentStatus: text('payment_status').default('pending').notNull(),
  paymentType: text('payment_type').notNull(), // 'full' or 'deposit'
  items: jsonb('items').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
