# @ingestkorea/util-jsonwebtoken

## Description
INGESTKOREA Util JsonWebToken Handler for Node.js.

## Installing
```sh
npm install @ingestkorea/util-jsonwebtoken
```

## Getting Started

### Support Algorithm

+ ES256 (ECDSA using P-256 curve and SHA-256 hash algorithm)

### Create KeyPair

```js
import { writeFileSync } from 'node:fs';
import { createJsonWebKeyEC256 } from '@ingestkorea/util-jsonwebtoken';
(async () => {
    const dist = __dirname + '/' + 'keyInfo.json';
    const keyInfo = await createJsonWebKeyEC256();
    writeFileSync(dist, JSON.stringify(keyInfo, null, 2), 'utf-8');
    console.log({ dist, keyInfo });
    // {
    //     dist: DIST_FILE_PATH,
    //     keyInfo: KEY_INFO
    // }
})();
```

### Import

```typescript
import {
    JsonWebTokenClient,
    CreateTokenHandlerInput,
    VerifyTokenHandlerInput
} from '@ingestkorea/util-jsonwebtoken';
import { publicKey, privateKey } from './keyInfo.json';
```

### Usage

#### [ CreateToken ] 

+ Initiate client with configuration.

```typescript
const client = new JsonWebTokenClient({
    mode: 'sign',
    credentials: {
        privateKey: privateKey
    },
    options: {
        issuer: 'hello-world.com',
        expiresIn: 3600 * 3, // optional, default 3600
        serviceName: 'sample-servie' // optional
    }
});

(async () => {
    try {
        let params: CreateTokenHandlerInput = {
            userName: 'John Doe', // sample
            isAdmin: true // sample
        };
        let data = await client.create(params);
        console.log(data)
    } catch (err) {
        if (err instanceof Error) console.log(err.message);
        if (err instanceof IngestkoreaError) console.log(err);
    };
})();
```

#### [ VerifyToken ]

+ Initiate client with configuration.

```js
let client = new JsonWebTokenClient({
    mode: 'verify',
    credentials: {
        publicKey: publicKey
    }
});

(async () => {
    let inputToken = 'xxx.yyy.zzz';
    let params = { token: inputToken };
    try {
        let data = await client.verify(params);
        console.log(data)
    } catch (err) {
        if (err instanceof Error) console.log(err.message);
        if (err instanceof IngestkoreaError) console.log(err);
    };
})();
```