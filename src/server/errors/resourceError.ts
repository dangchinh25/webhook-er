import { ErrorConstructorParams } from '../types';

export class ResourceError extends Error {
    message: string;
    code?: string;
    error?: Error | unknown;
    requestId?: string;
    statusCode: number;

    constructor ( {
        message,
        code,
        error,
        statusCode
    }: ErrorConstructorParams ) {
        super();

        this.message = message;
        this.code = code;
        this.error = error;
        this.statusCode = statusCode || 500;
    }
}