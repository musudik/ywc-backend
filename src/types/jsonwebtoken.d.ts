declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: object
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: object
  ): JwtPayload | string;
  
  export class JsonWebTokenError extends Error {
    constructor(message: string);
    name: string;
  }

  export class TokenExpiredError extends Error {
    constructor(message: string);
    name: string;
    expiredAt: Date;
  }
} 