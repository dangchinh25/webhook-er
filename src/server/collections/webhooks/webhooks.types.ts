import { Webhook } from '../../../db';
import { ResourceError } from '../../errors';
import { createWebhookSchema } from './webhooks.validation';

export type CreateWebhooksResponse = {
    successes: {
        params: typeof createWebhookSchema['_input'];
        webhook: typeof Webhook.$inferSelect;
    }[];
    failures: {
        params: typeof createWebhookSchema['_input'];
        error: ResourceError;
    }[];
};