import { RequestMethod } from '../../types';

export type QstashServiceRequestParams = {
    method: RequestMethod;
    destinationUrl: string;
    payload: Record<string, unknown>;
    customHeaders?: Record<string, unknown>;
};