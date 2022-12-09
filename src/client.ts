import { JsonWebKey } from 'node:crypto';
import { IngestkoreaError } from '@ingestkorea/util-error-handler';
import {
  createTokenHandler, CreateTokenHandlerInput,
  verifyTokenHandler, VerifyTokenHandlerInput
} from './handler';
import { hostname, userInfo } from 'node:os';
const HOST_NAME = hostname();
const { username: USER_NAME } = userInfo();

export interface JsonWebTokenClientConfig {
  mode?: 'sign' | 'verify'
  credentials?: {
    privateKey?: JsonWebKey
    publicKey?: JsonWebKey
  }
  options?: {
    expiresIn?: number
    issuer?: string
    serviceName?: string
  }
};

export interface JsonWebTokenClientResolvedConfig {
  mode: JsonWebTokenClientResolvedMode
};

export interface JsonWebTokenClientResolvedMode {
  sign?: JsonWebTokenClientResolvedSignMode,
  verfiy?: JsonWebTokenClientResolvedVerifyMode
};

export interface JsonWebTokenClientResolvedSignMode {
  privateKey: JsonWebKey
  expiresIn: number
  issuer: string
  serviceName: string
};

export interface JsonWebTokenClientResolvedVerifyMode {
  publicKey: JsonWebKey
};

export const DEFAULT_EXPIRES_IN = 3600;
export const DEFAULT_ISSUER = HOST_NAME;
export const DEFAULT_SERVICE_NAME = `${USER_NAME} token service`;

export class JsonWebTokenClient {
  config: JsonWebTokenClientResolvedConfig
  constructor(config: JsonWebTokenClientConfig) {
    const resolvedConfig = resolveClientConfig(config);
    this.config = {
      ...resolvedConfig
    };
  };
  async create(input: CreateTokenHandlerInput) {
    const output = await createTokenHandler(input, this.config);
    return output;
  };
  async verify(input: VerifyTokenHandlerInput) {
    const output = await verifyTokenHandler(input, this.config);
    return output;
  };
};

const resolveClientConfig = (input: JsonWebTokenClientConfig): JsonWebTokenClientResolvedConfig => {
  return {
    mode: resolveClientMode(input)
  };
};

const resolveClientMode = (input: JsonWebTokenClientConfig): JsonWebTokenClientResolvedMode => {
  const isValid = input.mode == 'sign' || input.mode == 'verify';
  if (!isValid) throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'Invalid Client Mode'
  });
  return {
    sign: input.mode == 'sign' ? resolveSignMode(input) : undefined,
    verfiy: input.mode == 'verify' ? resolveVerifyMode(input) : undefined
  };
};

const resolveSignMode = (
  input: JsonWebTokenClientConfig
): JsonWebTokenClientResolvedSignMode => {
  const { mode, credentials, options } = input;

  if (mode != 'sign') throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'Invalid Client Sign Mode'
  });
  if (!credentials?.privateKey) throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'Invalid Client Credential Config. Please Check PrivateKey'
  });
  return {
    privateKey: credentials.privateKey,
    expiresIn: options?.expiresIn != undefined ? options.expiresIn : DEFAULT_EXPIRES_IN,
    issuer: options?.issuer != undefined ? options.issuer : DEFAULT_ISSUER,
    serviceName: options?.serviceName != undefined ? options.serviceName : DEFAULT_SERVICE_NAME
  };
};

const resolveVerifyMode = (input: JsonWebTokenClientConfig): JsonWebTokenClientResolvedVerifyMode => {
  const { mode, credentials } = input;
  if (mode != 'verify') throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'Invalid Client Verify Mode'
  });
  if (!credentials?.publicKey) throw new IngestkoreaError({
    code: 400, type: 'Bad Request',
    message: 'Invalid Params', description: 'Invalid Client Credential Config. Please Check PublicKey'
  });
  return {
    publicKey: credentials.publicKey
  };
};