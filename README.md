# @ingestkorea/util-jsonwebtoken

[![npm (scoped)](https://img.shields.io/npm/v/@ingestkorea/util-jsonwebtoken?style=flat-square)](https://www.npmjs.com/package/@ingestkorea/util-jsonwebtoken)
[![NPM downloads](https://img.shields.io/npm/dm/@ingestkorea/util-jsonwebtoken?style=flat-square)](https://www.npmjs.com/package/@ingestkorea/util-jsonwebtoken)

## Description
INGESTKOREA Utility JsonWebToken Handler for Node.js.

## Installing
```sh
npm install @ingestkorea/util-jsonwebtoken
```

## Getting Started

### Pre-requisites
+ Use TypeScript v4.x
+ Includes the TypeScript definitions for node.
  ```sh
  npm install -D @types/node # save dev mode
  ```

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
  //   dist: DIST_FILE_PATH,
  //   keyInfo: KEY_INFO
  // }
})();
```

### Import

```typescript
import { IngestkoreaError } from '@ingestkorea/util-error-handler';
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
// a client can be shared by different CreateTokenHandlerInput params.
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
    console.log(err);
  };
})();
```

#### [ VerifyToken ]

+ Initiate client with configuration.

```js
// a client can be shared by different VerifyTokenHandlerInput params.
let client = new JsonWebTokenClient({
  mode: 'verify',
  credentials: {
    publicKey: publicKey
  }
});

(async () => {
  let inputToken = 'xxx.yyy.zzz';
  let params: VerifyTokenHandlerInput = {
    token: inputToken
  };
  try {
    let data = await client.verify(params);
    console.log(data)
  } catch (err) {
    console.log(err);
  };
})();
```

## License
This Utility is distributed under the [MIT License](https://opensource.org/licenses/MIT), see LICENSE for more information.