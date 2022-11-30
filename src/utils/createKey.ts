import { generateKeySync, randomUUID, JsonWebKey } from 'node:crypto';

export const createJsonWebKeyAES256 = async (): Promise<JsonWebKey> => {
  const ALGORITHM = 'aes';
  const KEY_LENGTH = 256;
  const MODE = 'cbc';
  let jwk = generateKeySync(ALGORITHM, { length: KEY_LENGTH }).export({ format: 'jwk' })
  jwk['kid'] = randomUUID();
  jwk['alg'] = [ALGORITHM, KEY_LENGTH, MODE].join('-');
  return jwk;
};