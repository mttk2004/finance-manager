import { pgTable, text, timestamp, uuid, boolean, bigint, jsonb, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

export const fundsRelations = relations(funds, ({ many }) => ({
  transactions: many(transactions),
}));

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  fundId: uuid('fund_id').notNull().references(() => funds.id, { onDelete: 'cascade' }),
  toFundId: uuid('to_fund_id').references(() => funds.id, { onDelete: 'set null' }), // Used for transfers
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  fund: one(funds, {
    fields: [transactions.fundId],
    references: [funds.id],
    relationName: 'fromFund',
  }),
  toFund: one(funds, {
    fields: [transactions.toFundId],
    references: [funds.id],
    relationName: 'toFund',
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  amountLimit: bigint('amount_limit', { mode: 'number' }).notNull(),
  period: text('period').notNull(), // Format: YYYY-MM
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.categoryId, t.period)
]);

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }),
  notePreset: text('note_preset'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const templatesRelations = relations(templates, ({ one }) => ({
  category: one(categories, {
    fields: [templates.categoryId],
    references: [categories.id],
  }),
}));
