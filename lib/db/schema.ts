import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
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

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  markupUpdates: many(markupSettings, { relationName: 'userMarkupUpdates' }),
}));

export const markupSettingsRelations = relations(markupSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [markupSettings.updatedBy],
    references: [users.id],
    relationName: 'userMarkupUpdates',
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


export const socialSettings = pgTable('social_settings', {
  id: serial('id').primaryKey(),
  facebookLink: text('facebook_link').default(''),
  lineOaLink: text('line_oa_link').default(''),
  phoneNumber: text('phone_number').default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

export const socialSettingsRelations = relations(socialSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [socialSettings.updatedBy],
    references: [users.id],
  }),
}));

// Add these types to your existing type exports
export type SocialSetting = typeof socialSettings.$inferSelect;
export type NewSocialSetting = typeof socialSettings.$inferInsert;

export const verifiedSlips = pgTable('verified_slips', {
  id: serial('id').primaryKey(),
  transRef: text('trans_ref').notNull().unique(),
  amount: decimal('amount').notNull(),
  verifiedAt: timestamp('verified_at').notNull().defaultNow(),
  userId: integer('user_id').references(() => users.id),
});

export type VerifiedSlip = typeof verifiedSlips.$inferSelect;
export type NewVerifiedSlip = typeof verifiedSlips.$inferInsert;