import { kv } from '@vercel/kv'

export { kv }

// Keys for our office data
export const KEYS = {
    ANDREA_ABSENCE: 'office:andrea:absence',
    SPEED_COUNTER: 'office:speeds:total',
    COFFEE_MAKER: 'office:coffee:maker',
    OFFICE_MATES: 'office:team:members',
}
