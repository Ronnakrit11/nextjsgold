/*
  # Create Markup Settings Table
  
  1. New Tables
    - markup_settings: Stores gold price markup percentages
      - id (serial, primary key)
      - gold_spot_bid (decimal)
      - gold_spot_ask (decimal)
      - gold_9999_bid (decimal)
      - gold_9999_ask (decimal)
      - gold_965_bid (decimal)
      - gold_965_ask (decimal)
      - gold_association_bid (decimal)
      - gold_association_ask (decimal)
      - updated_at (timestamp)
      - updated_by (integer, references users)

  2. Initial Data
    - Insert default markup settings with 0% markup
*/

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
  "updated_by" integer REFERENCES "users"("id")
);

-- Insert initial markup settings
INSERT INTO markup_settings (
  gold_spot_bid, gold_spot_ask,
  gold_9999_bid, gold_9999_ask,
  gold_965_bid, gold_965_ask,
  gold_association_bid, gold_association_ask
) VALUES (0, 0, 0, 0, 0, 0, 0, 0);