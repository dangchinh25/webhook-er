/* eslint-disable @typescript-eslint/naming-convention */
import {
    integer, json, pgTable, serial, text, timestamp
} from 'drizzle-orm/pg-core';

export const Webhook = pgTable( 'webhooks', {
    id: serial( 'id' ).primaryKey(),
    payload: json( 'payload' ).notNull(),
    deliveryAddress: text( 'delivery_address' ).notNull(),
    attemptNumber: integer( 'attempt_number' ).notNull(),
    createdAt: timestamp( 'created_at', { withTimezone: true } ).defaultNow(),
    updated: timestamp( 'updated_at', { withTimezone: true } )
} );