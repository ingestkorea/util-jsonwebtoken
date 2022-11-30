import { JsonWebTokenHeader, JsonWebTokenPayload } from './types';

export interface CreateTokenInput {
  header: JsonWebTokenHeader
  payload: JsonWebTokenPayload
};

export interface CreateTokenOutput {
  token: string
  expires: number
};
