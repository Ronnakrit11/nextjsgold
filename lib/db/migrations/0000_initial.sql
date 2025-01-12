/*
  # Initial Schema Setup
  
  1. Tables
    - users
    - teams
    - team_members
    - activity_logs
    - invitations
    - markup_settings

  2. Relationships
    - All foreign key constraints
    - Default values
    - Timestamps
*/

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100),
  "email" varchar(255) NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "role" varchar(20) DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "teams" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "stripe_customer_id" text UNIQUE,
  "stripe_subscription_id" text UNIQUE,
  "stripe_product_id" text,
  "plan_name" varchar(50),
  "subscription_status" varchar(20)
);

CREATE TABLE IF NOT EXISTS "team_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "team_id" integer NOT NULL,
  "role" varchar(50) NOT NULL,
  "joined_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
  CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id")
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "user_id" integer,
  "action" text NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "ip_address" varchar(45),
  CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "email" varchar(255) NOT NULL,
  "role" varchar(50) NOT NULL,
  "invited_by" integer NOT NULL,
  "invited_at" timestamp DEFAULT now() NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "markup_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "gold_spot_bid" decimal DEFAULT '0',
  "gold_spot_ask" decimal DEFAULT '0',
  "gold_9999_bid" decimal DEFAULT '0',
  "gold_9999_ask" decimal DEFAULT '0',
  "gold_965_bid" decimal DEFAULT '0',
  "gold_965_ask" decimal DEFAULT '0',
  "gold_association_bid" decimal DEFAULT '0',
  "gold_association_ask" decimal DEFAULT '0',
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" integer,
  CONSTRAINT "markup_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id")
);

-- Insert initial markup settings
INSERT INTO markup_settings (
  gold_spot_bid, gold_spot_ask,
  gold_9999_bid, gold_9999_ask,
  gold_965_bid, gold_965_ask,
  gold_association_bid, gold_association_ask
) VALUES (0, 0, 0, 0, 0, 0, 0, 0);