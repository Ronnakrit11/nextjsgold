import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined')
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Cache keys
export const CACHE_KEYS = {
  GOLD_PRICES: 'gold_prices',
  USER_BALANCE: (userId: number) => `user_balance:${userId}`,
  GOLD_ASSETS: (userId: number) => `gold_assets:${userId}`,
  MARKUP_SETTINGS: 'markup_settings'
}

// Cache TTLs in seconds
export const CACHE_TTL = {
  GOLD_PRICES: 60, // 1 minute
  USER_BALANCE: 300, // 5 minutes
  GOLD_ASSETS: 300, // 5 minutes
  MARKUP_SETTINGS: 3600 // 1 hour
}