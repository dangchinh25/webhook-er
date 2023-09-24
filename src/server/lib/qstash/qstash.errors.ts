import { ResourceError } from '../../errors';

export class QstashServiceError extends ResourceError {
    constructor ( error?: unknown ) {
        const message = 'A server error was encoutered while communicatint with Qstash Service';
        const code = 'QSTASH_SERVICE_ERROR';

        super( { message, code, error } );
    }
}