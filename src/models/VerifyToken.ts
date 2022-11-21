import { JsonWebTokenHeader, JsonWebTokenPayload } from './types';

export interface VerifyTokenInput {
    token?: string
};

export interface VerifyTokenOutput {
    header?: Partial<JsonWebTokenHeader>
    payload?: Partial<JsonWebTokenPayload>
    signature?: string
};