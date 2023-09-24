import { ResourceError } from './resourceError';

export class InternalServerError extends ResourceError {
    public constructor () {
        const message = 'Internal server error.';
        const code = 'INTERNAL_SERVER_ERROR';
        super( {
            message: message,
            code: code
        } );
    }
}
