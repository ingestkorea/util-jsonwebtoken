import { generateKeyPairSync } from 'crypto';

export const createJsonWebKeyEC256 = async () => {
    const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const jwk_private = privateKey.export({ format: 'jwk' });
    const jwk_public = publicKey.export({ format: 'jwk' });
    return { publicKey: jwk_public, privateKey: jwk_private };
};

export const createJsonWebKeyRSA2048 = async () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwk_private = privateKey.export({ format: 'jwk' });
    const jwk_public = publicKey.export({ format: 'jwk' });
    return { publicKey: jwk_public, privateKey: jwk_private };
};