import { Webhook, dbClient } from '../../db';

export class Factory {
    async getWebhook (
        newWebhook: Partial<typeof Webhook.$inferInsert> = {}
    ): Promise<typeof Webhook.$inferSelect> {
        const webhook: typeof Webhook.$inferInsert = {
            deliveryAddress: 'http://localhost:3000/something',
            payload: {},
            attemptNumber: 1,
            ...newWebhook
        };

        const [ createdWebhook ] = await dbClient
            .insert( Webhook )
            .values( webhook )
            .returning();

        return createdWebhook;
    }
}