export interface JsonWebTokenHeader {
    typ: 'JWT'
    alg: 'ES256'
};
export interface JsonWebTokenPayload extends JsonWebTokenPayloadType {

};

export type JsonWebTokenPayloadType = JsonWebTokenRegisteredClaim & JsonWebTokenPublicClaim;
export type JsonWebTokenRegisteredClaim = {
    iss: string
    iat: number
    exp: number
    jti: string
};
export type JsonWebTokenPublicClaim = {
    [key: string]: string | undefined | number | boolean
};