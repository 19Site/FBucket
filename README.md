# FBucket

A Node.js file server and api to help you manage your file assets.

## Quickstart - Node.js

```sh
$ npm install fbucket
```

## API

Require FBucket

```js
const FBucket = require('fbucket');
```

### FBucket.startServer(config)

Start file bucket server.

```js
// server config
var config = {

	 portHttp: 80,
	 
	 portHttps: 443,
	 
	 sslKeyFile: 'www.mydomain.com.key',
	 
	 sslCertFile: 'www.mydomain.com.cert',
	 
	 assetUrl: 'https://www.mydomain.com'
};

// start server
FBucket.startServer(config);
```

Parameters:
-	config 
	-	portHttp - (number) port number for HTTP (default: 60080)
	- 	portHttps - (number) port number for HTTPS (default: 60443)
	-	enableHttps - (boolean) is enable HTTPS server (default: true)
	-	sslKeyFile - (string) path to ssl key file (for HTTPS server) (default: path to a self-signed key)
	-	sslCertFile - (string) path to ssl cert file (for HTTPS server) (default: path to a self-signed cert)
	-	assetUrl - (string) a url that prepend to uploaded file (default: www.example.com)
	-	localDirectory - (string) a local path of a directory to store uploaded files
	-	apiKey - (string) a api key to prevent anonymous upload

### FBucket.putFile(options, callback)

API for put file(s) to FBucket server.

```js
// options
var options = {

	serverUrl: 'http://www.mydomain.com',

	files: 'path_to_file.jpg'
};

// put file (promise version)
var data = await FBucket.putFile(options);

// put file (callback version)
FBucket.putFile(options, (err, data) => {
	
	// action failure
	if(err) {
	
		return console.error(err);
	} 
	
	// action success
	else {
		
		return console.dir(data);
	}
});
```

Parameters:
-	options
	-	serverUrl - (string) the url of FBucket server
	-	files - (string|string[]) file path of upload file(s)
	-	key - (string) an api key for FBucket server
-	callback - (function) a callback function (no callback provided will consider as promise mode)
	-	err - (object) a error object if error occure
	-	data - (object) a data object if upload success
