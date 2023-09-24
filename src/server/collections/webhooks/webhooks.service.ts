import { Either, success } from '../../types';
import { Webhook, dbClient } from '../../../db';
import { ResourceError } from '../../errors';

export const createWebhook = async (
    webhook: typeof Webhook.$inferInsert
): Promise<Either<ResourceError, typeof Webhook.$inferSelect>> => {
    const [ createdWebhook ] = await dbClient
        .insert( Webhook )
        .values( webhook )
        .returning();

    return success( createdWebhook );
};