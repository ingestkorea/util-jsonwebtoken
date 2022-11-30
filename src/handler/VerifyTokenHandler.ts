import { createVerify, JsonWebKey } from 'node:crypto';
import { IngestkoreaError } from '@ingestkorea/util-error-handler';
import { JsonWebTokenClientResolvedConfig } from '../client';
import {
  VerifyTokenInput, VerifyTokenOutput,
  JsonWebTokenHeader, JsonWebTokenPayload
} from '../models';
import { createPublicKeyObject, convertUnixTimeStamp } from '../utils';

export interface VerifyTokenHandlerInput extends VerifyTokenInput {

};
export interface VerifyTokenHandlerOutput extends VerifyTokenOutput {

};

export const verifyTokenHandler = async (
  input: VerifyTokenHandlerInput,
  config: JsonWebTokenClientResolvedConfig
): Promise<VerifyTokenHandlerOutput> => {
  const { token } = input;
  const { mode, credentials } = config;
  const { publicKey } = credentials;
  if (!token) throw new IngestkoreaError({
    code: 401, type: 'Unauthorized',
    message: 'Invalid Credentials', description: 'Check Input Token'
  });
  if (mode != 'verify') throw new IngestkoreaError({
    code: 401, type: 'Unauthorized',
    message: 'Invalid Credentials', description: 'Check Verify Mode'
  });
  if (!publicKey) throw new IngestkoreaError({
    code: 401, type: 'Unauthorized',
    message: 'Invalid Credentials', description: 'Check Public Key'
  });

  const data = await convertToken({ token: token });
  await verifySignature(data, publicKey);
  await verifyExpires(data, publicKey);

  const response: VerifyTokenHandlerOutput = {
    header: data.header,
    payload: data.payload,
    signature: data.signature
  };
  return { ...response };
};

export interface ConvertTokenInput extends Required<VerifyTokenHandlerInput> {

};
export interface ConvertTokenOutput extends VerifyTokenHandlerOutput {
  stringToSign: string,
};

export const convertToken = async (
  input: ConvertTokenInput
): Promise<ConvertTokenOutput> => {
  const { token } = input;
  const splitToken = token.split('.');
  if (splitToken.length !== 3) throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Signature', description: 'Invalid Token Structure'
  });
  const [headerBase64Url, payloadBase64Url, signature] = splitToken;
  let resolvedHeader: any = {};
  let resolvedPayload: any = {};
  try {
    resolvedHeader = JSON.parse(Buffer.from(headerBase64Url, 'base64url').toString());
    resolvedPayload = JSON.parse(Buffer.from(payloadBase64Url, 'base64url').toString())
  } catch (err) {
    throw new IngestkoreaError({
      code: 400, type: 'Bad Request',
      message: 'Invalid Credentials', description: "Invalid Token Encoding"
    });
  };
  const data: any = {
    header: resolvedHeader,
    payload: resolvedPayload,
    signature: signature
  } // VerifyTokenOutput
  const contents = await deserialize_json_VerifyTokenOutput(data);
  const response: ConvertTokenOutput = {
    stringToSign: [headerBase64Url, payloadBase64Url].join('.'),
    header: contents.header,
    payload: contents.payload,
    signature: contents.signature
  };
  return response;
};

const deserialize_json_VerifyTokenOutput = async (output: any): Promise<VerifyTokenOutput> => {
  const { header, payload, signature } = output;
  return {
    header: deserialize_json_JsonWebTokenHeader(header),
    payload: deserialize_json_JsonWebTokenPayload(payload),
    signature: signature
  } as any;
};

const deserialize_json_JsonWebTokenHeader = (output: any): Partial<JsonWebTokenHeader> => {
  const { typ, alg } = output;
  return {
    typ: typ != undefined ? typ : undefined,
    alg: alg != undefined ? alg : undefined
  };
};

const deserialize_json_JsonWebTokenPayload = (output: any): Partial<JsonWebTokenPayload> => {
  const { iss, iat, exp, jti } = output;
  return {
    iss: iss != undefined ? iss : undefined,
    iat: iat != undefined ? iat : undefined,
    exp: exp != undefined ? exp : undefined,
    jti: jti != undefined ? jti : undefined,
    ...output,
  };
};

export const verifySignature = async (input: ConvertTokenOutput, publicKey: JsonWebKey): Promise<void> => {
  const { stringToSign, header, payload, signature } = input;
  if (!signature) throw new IngestkoreaError({
    code: 400, type: 'Bad Request', message: 'Invalid Request', description: 'Signature Undefined'
  });

  const publicKeyObject = await createPublicKeyObject(publicKey);
  const isValid = createVerify('sha256')
    .update(stringToSign, 'utf-8').end()
    .verify(publicKeyObject, signature, 'base64url');
  if (!isValid) throw new IngestkoreaError({
    code: 401, type: 'Unauthorized', message: 'Invalid Signature'
  });
  return;
};

export const verifyExpires = async (input: ConvertTokenOutput, publicKey: JsonWebKey): Promise<void> => {
  const { stringToSign, header, payload, signature } = input;
  const { milliseconds, seconds: current } = await convertUnixTimeStamp();

  if (!payload) throw new IngestkoreaError({
    code: 400, type: 'Bad Request', message: 'Invalid Request', description: 'Payload Undefined'
  });
  const { iat, exp } = payload;
  if (!iat || !exp) throw new IngestkoreaError({
    code: 400, type: 'Bad Request', message: 'Invalid Request', description: 'Iat Or Exp Undefined'
  });

  if (current > exp || current < iat) throw new IngestkoreaError({
    code: 401, type: 'Unauthorized', message: 'Invalid Credentials', description: 'Token Expired'
  });

  return;
};