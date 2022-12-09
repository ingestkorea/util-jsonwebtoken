import { createSign, JsonWebKey, randomUUID } from 'node:crypto';
import { IngestkoreaError } from '@ingestkorea/util-error-handler';
import { JsonWebTokenClientResolvedConfig } from '../client';
import { CreateTokenInput, CreateTokenOutput, JsonWebTokenPublicClaim } from '../models';
import { createPrivateKeyObject, convertUnixTimeStamp } from '../utils';

export interface CreateTokenHandlerInput extends JsonWebTokenPublicClaim {

};
export interface CreateTokenHandlerOutput extends CreateTokenOutput {

};

export const createTokenHandler = async (
  input: CreateTokenHandlerInput, config: JsonWebTokenClientResolvedConfig
): Promise<CreateTokenHandlerOutput> => {
  if (!config.mode.sign) throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'JsonWebTokenClient is not sign mode'
  });

  const { privateKey, expiresIn, issuer, serviceName } = config.mode.sign;
  const { seconds: current } = await convertUnixTimeStamp();
  const expires = current + expiresIn;
  const uuid = randomUUID();

  const params: CreateTokenInput = {
    header: { typ: 'JWT', alg: 'ES256' },
    payload: {
      ...input,
      ...(serviceName != undefined && { service: serviceName }),
      iss: issuer,
      jti: uuid,
      iat: current,
      exp: expires,
    }
  };
  const { stringToSign, signature } = await createSignature(params, privateKey);
  return {
    token: [stringToSign, signature].join('.'),
    expires: params.payload.exp
  };
};

export const createSignature = async (
  input: CreateTokenInput, privateKey: JsonWebKey
): Promise<{ stringToSign: string, signature: string }> => {
  const stringToSign = await createStringToSign(input);
  const privateKeyObject = await createPrivateKeyObject(privateKey);
  const signature = createSign('sha256')
    .update(stringToSign, 'utf-8').end()
    .sign(privateKeyObject, 'base64url');
  return { stringToSign, signature };
};

export const createStringToSign = async (input: CreateTokenInput): Promise<string> => {
  const { header, payload } = input;
  const serialized_header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const serialized_payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return [serialized_header, serialized_payload].join('.');
};