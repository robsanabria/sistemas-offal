import { kv } from '@vercel/kv'

export { kv }

/**
 * TTL de las salas de pictionary y sus listas de eventos, en segundos.
 * Sin esto cada sala creada queda en Redis para siempre: son keys que nadie
 * vuelve a mirar y que igual cuentan para el tamaño de la base.
 * Se refresca en cada escritura, así que una sala en uso no se vence.
 */
export const TTL_SALA_SEG = 60 * 60 * 24

/** Tope de eventos que guardamos por sala (el canvas se rearma con los últimos). */
export const MAX_EVENTOS_EN_LISTA = 500

// Keys for our office data
export const KEYS = {
    ANDREA_ABSENCE: 'office:andrea:absence',
    ANDREA_LAST: 'office:andrea:last',
    ROBERTO_ABSENCE: 'office:roberto:absence',
    ROBERTO_LAST: 'office:roberto:last',
    SPEED_COUNTER: 'office:speeds:total',
    COFFEE_MAKER: 'office:coffee:maker',
    OFFICE_MATES: 'office:team:members',
    GLOBAL_TICKER: 'office:global:ticker',
}
