import { ResourceNotFound } from '../../errors';

export class WebhookNotFound extends ResourceNotFound {
    public constructor () {
        const message = 'This requested webhook was not found.';
        const code = 'WEBHOOK_NOT_FOUND';
        super( { message, code } );
    }
}
