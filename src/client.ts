import { JsonWebKey } from 'node:crypto';
import { IngestkoreaError } from '@ingestkorea/util-error-handler';
import {
    CreateTokenHandler, CreateTokenHandlerInput,
    VerifyTokenHandler, VerifyTokenHandlerInput
} from './handler';

export const DEFAULT_EXPIRES_IN = 3600;
export const DEFAULT_ISSUER = 'verify mode';

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
    mode: 'sign' | 'verify'
    credentials: {
        privateKey?: JsonWebKey
        publicKey?: JsonWebKey
    }
    options: {
        expiresIn: number
        issuer: string
        serviceName?: string
    }
};

export class JsonWebTokenClient {
    config: JsonWebTokenClientResolvedConfig
    constructor(config: JsonWebTokenClientConfig) {
        let { mode, credentials, options } = config;
        if (!mode || !(mode === 'sign' || mode === 'verify')) throw new IngestkoreaError({
            code: 401, type: 'Unauthorized',
            message: 'Invalid Credentials', description: 'Invalid Client Mode'
        });
        if (!credentials) throw new IngestkoreaError({
            code: 401, type: 'Unauthorized',
            message: 'Invalid Credentials', description: 'Invalid Client Credentials'
        });
        if (!options) options = {};

        const { privateKey, publicKey } = credentials;
        const { expiresIn, issuer } = options;
        let resolvedExpiresIn = 0;
        let resolvedIssuer = '';

        if (mode === 'sign') {
            resolvedExpiresIn = expiresIn ? expiresIn : DEFAULT_EXPIRES_IN;
            if (!issuer) throw new IngestkoreaError({
                code: 401, type: 'Unauthorized',
                message: 'Invalid Credentials', description: 'Invalid Client Issuer'
            });
        };
        if (mode == 'verify') resolvedIssuer = DEFAULT_ISSUER;

        this.config = {
            mode: mode,
            credentials: {
                ...credentials,
                ...(privateKey != undefined && { privateKey: privateKey }),
                ...(publicKey != undefined && { publicKey: publicKey })
            },
            options: {
                ...options,
                expiresIn: resolvedExpiresIn,
                issuer: resolvedIssuer
            }
        };
    };
    async create(input: CreateTokenHandlerInput) {
        const output = await CreateTokenHandler(input, this.config);
        return output;
    };
    async verify(input: VerifyTokenHandlerInput) {
        const output = await VerifyTokenHandler(input, this.config);
        return output;
    };
};