import { createPrivateKey, createPublicKey, JsonWebKey, JsonWebKeyInput } from 'node:crypto';

export const createPrivateKeyObject = async (jwk_private: JsonWebKey) => {
  return createPrivateKey({ format: 'jwk', key: jwk_private });
};

export const createPublicKeyObject = async (jwk_public: JsonWebKey) => {
  return createPublicKey({ format: 'jwk', key: jwk_public });
};

export const convertPrivateKeyToPem = async (jwk_private: JsonWebKey) => {
  const keyObject = await createPrivateKeyObject(jwk_private)
  return keyObject.export({ format: 'pem', type: 'pkcs8' }).toString('utf-8');
};

export const convertPublicKeyToPem = async (jwk_public: JsonWebKey) => {
  const keyObject = await createPublicKeyObject(jwk_public)
  return keyObject.export({ format: 'pem', type: 'spki' }).toString('utf-8');
};
