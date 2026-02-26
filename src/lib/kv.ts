import { Redis } from '@upstash/redis'

export const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Keys for our office data
export const KEYS = {
  ANDREA_ABSENCE: 'office:andrea:absence',
  SPEED_COUNTER: 'office:speeds:total',
  COFFEE_MAKER: 'office:coffee:maker',
  OFFICE_MATES: 'office:team:members',
}
