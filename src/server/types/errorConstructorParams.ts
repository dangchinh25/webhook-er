export interface ErrorConstructorParams {
    message: string;
    code?: string;
    error?: Error | unknown;
    statusCode?: number;
}