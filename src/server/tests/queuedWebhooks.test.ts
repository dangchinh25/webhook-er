import { appRouter } from '..';
import { Webhook } from '../../db';
import { Factory } from '../factory';
import * as WebhookServiceModule from '../collections/webhooks/webhooks.service';
import * as ExternalApiRequestModule from '../lib/externalApiRequest/externalApiRequest.request';
import { error, success } from '../types';
import { ResourceError } from '../errors';

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

        it( 'sends webhook to delivery address and updates database', async () => {
            const input = { webhookId: webhook.id };

            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const makeRequestSpy = jest.spyOn( ExternalApiRequestModule, 'makeRequest' );

            makeRequestSpy.mockImplementationOnce( async () => success( {} ) );

            const processQueuedWebhookResult = await trpcCaller.processQueuedWebhook( input );

            expect( processQueuedWebhookResult ).toStrictEqual( {} );

            expect( makeRequestSpy ).toHaveBeenCalledTimes( 1 );
            expect( makeRequestSpy ).toHaveBeenCalledWith( {
                method: 'POST',
                url: webhook.deliveryAddress,
                body: webhook.payload
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                webhook.id,
                { deliveredAt: expect.anything(), status: 'delivered' }
            );
        } );
    } );

    describe( 'webhook got sent twice', () => {
        let webhook: typeof Webhook.$inferSelect;

        beforeAll( async () => {
            const factory = new Factory();
            webhook = await factory.getWebhook( { deliveredAt: new Date() } );
        } );

        it( 'does nothing and return early the 2nd time', async () => {
            const input = { webhookId: webhook.id };

            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const makeRequestSpy = jest.spyOn( ExternalApiRequestModule, 'makeRequest' );

            const processQueuedWebhookResult = await trpcCaller.processQueuedWebhook( input );

            expect( processQueuedWebhookResult ).toStrictEqual( {} );

            expect( makeRequestSpy ).toHaveBeenCalledTimes( 0 );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 0 );
        } );
    } );

    describe( 'external api requests fails', () => {
        let webhook: typeof Webhook.$inferSelect;

        beforeAll( async () => {
            const factory = new Factory();
            webhook = await factory.getWebhook();
        } );

        it( 'sends webhook to delivery address and updates database', async () => {
            const input = { webhookId: webhook.id };

            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const makeRequestSpy = jest.spyOn( ExternalApiRequestModule, 'makeRequest' );

            makeRequestSpy.mockImplementationOnce( async () => error( new ResourceError( { message: '' } ) ) );

            const processQueuedWebhookResult = await trpcCaller.processQueuedWebhook( input );

            expect( processQueuedWebhookResult ).toBeInstanceOf( ResourceError );

            expect( makeRequestSpy ).toHaveBeenCalledTimes( 1 );
            expect( makeRequestSpy ).toHaveBeenCalledWith( {
                method: 'POST',
                url: webhook.deliveryAddress,
                body: webhook.payload
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                webhook.id,
                { attemptNumber: webhook.attemptNumber + 1 }
            );
        } );
    } );
} );