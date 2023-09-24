/* eslint-disable @typescript-eslint/no-explicit-any */
export type PublishMessageResponse = {
    messageId: string;
    url: string;
    deduplicated?: boolean;
};

export type PublishMessageParams = {
    destinationUrl: string;
    payload: Record<string, any>;
};