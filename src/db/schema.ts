/* eslint-disable @typescript-eslint/naming-convention */
import {
    integer, jsonb, pgTable, serial, text, timestamp
} from 'drizzle-orm/pg-core';

export const Webhook = pgTable( 'webhooks', {
    id: serial( 'id' ).primaryKey(),
    payload: jsonb( 'payload' ).notNull(),
    deliveryAddress: text( 'delivery_address' ).notNull(),
    attemptNumber: integer( 'attempt_number' ).notNull(),
    deliveredAt: timestamp( 'delivered_at', { withTimezone: true } ),
    createdAt: timestamp( 'created_at', { withTimezone: true } ).defaultNow(),
    updated: timestamp( 'updated_at', { withTimezone: true } )
} );