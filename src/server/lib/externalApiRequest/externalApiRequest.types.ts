import { RequestMethod } from '../../types';

export type MakeRequestParams = {
    method: RequestMethod.POST;
    url: string;
    body: Record<string, unknown>;
};