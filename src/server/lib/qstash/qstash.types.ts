/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestMethod } from '../../types';

export type QstashServiceRequestParams = {
    method: RequestMethod;
    destinationUrl: string;
    payload: Record<string, any>;
};