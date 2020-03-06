# File-Bucket

A Node.js file server and api to help you manage your file assets.

## Quickstart - Node.js

> npm install file-bucket

## API

Start file bucket server:

```js
// require module
const FileBucket = require('file-bucket');
 
// server config
var config = {};

// start server
FileBucket.start(config);
```

Config detial:

- portHttp - (number) port number for HTTP
- portHttps - (number) port number for HTTPS
