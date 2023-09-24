import { inferProcedureInput } from '@trpc/server';
import { AppRouter, appRouter } from '..';
import * as WebhookServiceModule from '../collections/webhooks/webhooks.service';

const trpcCaller = appRouter.createCaller( {} );

describe( 'createWebhook', () => {
    describe( 'generic success flow', () => {
        it( 'creates webhook in database', async () => {
            const input: inferProcedureInput<AppRouter['createWebhook']> = {
                payload: { test: 'test-data' },
                deliveryAddress: 'http://localhost:3000/something'
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );

            const createWebhookResult = await trpcCaller.createWebhook( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.payload,
                deliveryAddress: input.deliveryAddress,
                attemptNumber: 1
            } );

            expect( createWebhookResult ).toStrictEqual(
                expect.objectContaining( {
                    payload: input.payload,
                    deliveryAddress: input.deliveryAddress,
                    attemptNumber: 1
                } )
            );
        } );
    } );
} );