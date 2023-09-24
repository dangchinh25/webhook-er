import {
    Either, error, success
} from '../../types';
import { Webhook, dbClient } from '../../../db';
import { ResourceError } from '../../errors';
import { WebhookNotFound } from './webhooks.errors';
import { eq } from 'drizzle-orm';

export const createWebhook = async (
    webhook: typeof Webhook.$inferInsert
): Promise<Either<ResourceError, typeof Webhook.$inferSelect>> => {
    const [ createdWebhook ] = await dbClient
        .insert( Webhook )
        .values( webhook )
        .returning();

    return success( createdWebhook );
};

export const getWebhook = async (
    id: typeof Webhook.$inferSelect['id']
): Promise<Either<ResourceError | WebhookNotFound, typeof Webhook.$inferSelect>> => {
    const webhook = await dbClient
        .query
        .Webhook
        .findFirst( { where: eq( Webhook.id, id ) } );

    if ( !webhook ) {
        return error( new WebhookNotFound() );
    }

    return success( webhook );
};