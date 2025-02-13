// Add these imports at the top of the file
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});


export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const markupSettings = pgTable('markup_settings', {
  id: serial('id').primaryKey(),
  goldSpotBid: decimal('gold_spot_bid').default('0'),
  goldSpotAsk: decimal('gold_spot_ask').default('0'),
  gold9999Bid: decimal('gold_9999_bid').default('0'),
  gold9999Ask: decimal('gold_9999_ask').default('0'),
  gold965Bid: decimal('gold_965_bid').default('0'),
  gold965Ask: decimal('gold_965_ask').default('0'),
  goldAssociationBid: decimal('gold_association_bid').default('0'),
  goldAssociationAsk: decimal('gold_association_ask').default('0'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const socialSettings = pgTable('social_settings', {
  id: serial('id').primaryKey(),
  facebookLink: text('facebook_link').default(''),
  lineOaLink: text('line_oa_link').default(''),
  phoneNumber: text('phone_number').default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const verifiedSlips = pgTable('verified_slips', {
  id: serial('id').primaryKey(),
  transRef: text('trans_ref').notNull().unique(),
  amount: decimal('amount').notNull(),
  verifiedAt: timestamp('verified_at').notNull().defaultNow(),
  userId: integer('user_id').references(() => users.id),
});

export const userBalances = pgTable('user_balances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  balance: decimal('balance').notNull().default('0'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  markupUpdates: many(markupSettings, { relationName: 'userMarkupUpdates' }),
  balance: one(userBalances, {
    fields: [users.id],
    references: [userBalances.userId],
  }),
}));

export const markupSettingsRelations = relations(markupSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [markupSettings.updatedBy],
    references: [users.id],
    relationName: 'userMarkupUpdates',
  }),
}));

export const socialSettingsRelations = relations(socialSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [socialSettings.updatedBy],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type MarkupSetting = typeof markupSettings.$inferSelect;
export type NewMarkupSetting = typeof markupSettings.$inferInsert;
export type SocialSetting = typeof socialSettings.$inferSelect;
export type NewSocialSetting = typeof socialSettings.$inferInsert;
export type VerifiedSlip = typeof verifiedSlips.$inferSelect;
export type NewVerifiedSlip = typeof verifiedSlips.$inferInsert;
export type UserBalance = typeof userBalances.$inferSelect;
export type NewUserBalance = typeof userBalances.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

export const goldAssets = pgTable('gold_assets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  goldType: varchar('gold_type', { length: 50 }).notNull(),
  amount: decimal('amount').notNull().default('0'),
  purchasePrice: decimal('purchase_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add to your existing relations
export const goldAssetsRelations = relations(goldAssets, ({ one }) => ({
  user: one(users, {
    fields: [goldAssets.userId],
    references: [users.id],
  }),
}));

// Add to your existing types
export type GoldAsset = typeof goldAssets.$inferSelect;
export type NewGoldAsset = typeof goldAssets.$inferInsert;

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  goldType: varchar('gold_type', { length: 50 }).notNull(),
  amount: decimal('amount').notNull(),
  pricePerUnit: decimal('price_per_unit').notNull(),
  totalPrice: decimal('total_price').notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'buy' or 'sell'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Add to your existing relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Add to your existing types
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

// Add this to your existing schema.ts file, with the other table definitions

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  goldType: varchar('gold_type', { length: 50 }).notNull(),
  amount: decimal('amount').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  tel: varchar('tel', { length: 20 }).notNull(),
  address: text('address').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add to your existing relations
export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id],
  }),
}));

// Add to your existing types
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type NewWithdrawalRequest = typeof withdrawalRequests.$inferInsert;


// Add this to your existing schema.ts file, with the other table definitions

export const bankAccounts = pgTable('bank_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  bank: varchar('bank', { length: 50 }).notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add to your existing relations
export const bankAccountsRelations = relations(bankAccounts, ({ one }) => ({
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
}));

// Add to your existing types
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;

// Add to your existing schema.ts file

export const withdrawalMoneyRequests = pgTable('withdrawal_money_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: decimal('amount').notNull(),
  bank: varchar('bank', { length: 50 }).notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add to your existing relations
export const withdrawalMoneyRequestsRelations = relations(withdrawalMoneyRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalMoneyRequests.userId],
    references: [users.id],
  }),
}));

// Add to your existing types
export type WithdrawalMoneyRequest = typeof withdrawalMoneyRequests.$inferSelect;
export type NewWithdrawalMoneyRequest = typeof withdrawalMoneyRequests.$inferInsert;




// Add the product tables to the schema
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const goldProducts = pgTable('gold_products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => productCategories.id),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  weight: decimal('weight').notNull(),
  weightUnit: varchar('weight_unit', { length: 10 }).notNull(),
  purity: decimal('purity').notNull(),
  sellingPrice: decimal('selling_price').notNull(),
  workmanshipFee: decimal('workmanship_fee').notNull(),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add relations
export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(goldProducts),
}));

export const goldProductsRelations = relations(goldProducts, ({ one }) => ({
  category: one(productCategories, {
    fields: [goldProducts.categoryId],
    references: [productCategories.id],
  }),
}));

// Add types
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
export type GoldProduct = typeof goldProducts.$inferSelect;
export type NewGoldProduct = typeof goldProducts.$inferInsert;

// Keep all existing code below this point...