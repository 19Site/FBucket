# File-Bucket

A Node.js file server and api to help you manage your file assets.

## Quickstart - Node.js

> npm install file-bucket

## API

### start()

Start file bucket server.

```js
// require module
const FileBucket = require('file-bucket');
 
// server config
var config = {
 portHttp: 80,
 portHttps: 443,
 sslKeyFile: 'www.mydomain.com.key',
 sslCertFile: 'www.mydomain.com.cert',
 assetUrl: 'https://www.mydomain.com'
};

// start server
FileBucket.start(config);
```

Config detial:  
- portHttp - (number) port number for HTTP (default: 60080)
- portHttps - (number) port number for HTTPS (default: 60443)
- enableHttps - (boolean) is enable HTTPS server (default: true)
- sslKeyFile - (String) path to ssl key file (for HTTPS server) (default: path to a self-signed key)
- sslCertFile - (String) path to ssl cert file (for HTTPS server) (default: path to a self-signed cert)
- assetUrl - (String) a url that prepend to uploaded file (default: www.example.com)
