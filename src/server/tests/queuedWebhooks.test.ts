import { appRouter } from '..';
import { Webhook } from '../../db';
import { Factory } from '../factory';

const trpcCaller = appRouter.createCaller( {} );

describe( 'processQueuedWebhook', () => {
    describe( 'webhook does not exist', () => {
        it( 'returns error', async () => {
            const input = { webhookId: -1 };

            const processQueuedWebhookResult = await trpcCaller.processQueuedWebhook( input );

            expect( processQueuedWebhookResult ).toStrictEqual(
                expect.objectContaining( {
                    code: 'WEBHOOK_NOT_FOUND',
                    statusCode: 404
                } )
            );
        } );
    } );

    describe( 'generic success flow', () => {
        let webhook: typeof Webhook.$inferSelect;

        beforeAll( async () => {
            const factory = new Factory();
            webhook = await factory.getWebhook();
        } );

        // TODO to be updated later
        it( 'returns correct webhook', async () => {
            const input = { webhookId: webhook.id };

            const processQueuedWebhookResult = await trpcCaller.processQueuedWebhook( input );

            expect( processQueuedWebhookResult ).toStrictEqual( webhook );
        } );
    } );
} );