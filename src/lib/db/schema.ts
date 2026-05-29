import { pgTable, text, timestamp, uuid, boolean, bigint, jsonb, pgEnum, unique } from 'drizzle-orm/pg-core';

export const categoryTypeEnum = pgEnum('category_type', ['INCOME', 'EXPENSE']);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE', 'TRANSFER', 'LEND', 'BORROW']);

export const funds = pgTable('funds', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false),
  balance: bigint('balance', { mode: 'number' }).default(0),
  attributes: jsonb('attributes').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  fundId: uuid('fund_id').notNull().references(() => funds.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  amountLimit: bigint('amount_limit', { mode: 'number' }).notNull(),
  period: text('period').notNull(), // Format: YYYY-MM
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.categoryId, t.period)
]);

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }),
  notePreset: text('note_preset'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
