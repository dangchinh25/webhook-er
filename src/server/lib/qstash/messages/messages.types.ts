export type PublishMessageResponse = {
    messageId: string;
    url: string;
    deduplicated?: boolean;
};

export type PublishMessageParams = {
    destinationUrl: string;
    payload: Record<string, unknown>;
};