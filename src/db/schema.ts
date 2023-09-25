/* eslint-disable @typescript-eslint/naming-convention */
import {
    integer, jsonb, pgTable, serial, text, timestamp, pgEnum
} from 'drizzle-orm/pg-core';

export const WebhookType = pgEnum( 'webhook_types', [ 'instant', 'delayed' ] );

export const WebhookStatus = pgEnum( 'webhook_statuses', [
    'created',
    'queued',
    'delivered'
] );

export const Webhook = pgTable( 'webhooks', {
    id: serial( 'id' ).primaryKey(),
    payload: jsonb( 'payload' ).notNull(),
    deliveryAddress: text( 'delivery_address' ).notNull(),
    attemptNumber: integer( 'attempt_number' ).notNull(),
    deliveredAt: timestamp( 'delivered_at', { withTimezone: true } ),
    type: WebhookType( 'type' ),
    status: WebhookStatus( 'status' ).default( 'created' )
        .notNull(),
    createdAt: timestamp( 'created_at', { withTimezone: true } ).defaultNow(),
    updated: timestamp( 'updated_at', { withTimezone: true } )
} );