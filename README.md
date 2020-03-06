# File-Bucket

A Node.js file server and api to help you manage your file assets.

## Quickstart - Node.js

```sh
npm install file-bucket
```

## API

Require FileBucket

```js
const FileBucket = require('file-bucket');
```

### FileBucket.start(config)

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
FileBucket.start(config);
```

Parameters:
-	config 
	-	portHttp - (number) port number for HTTP (default: 60080)
	- 	portHttps - (number) port number for HTTPS (default: 60443)
	-	enableHttps - (boolean) is enable HTTPS server (default: true)
	-	sslKeyFile - (String) path to ssl key file (for HTTPS server) (default: path to a self-signed key)
	-	sslCertFile - (String) path to ssl cert file (for HTTPS server) (default: path to a self-signed cert)
	-	assetUrl - (String) a url that prepend to uploaded file (default: www.example.com)
	-	localDirectory - (String) a directory to store uploaded files
	-	apiKey - (String) a api key to prevent anonymous upload

### FileBucket.upload(options, callback)

API for upload file to FileBucket server.

```js
// options
var options = {

	serverUrl: 'http://www.mydomain.com',

	files: 'path_to_file.jpg'
};

// upload file (promise version)
var data = await FileBucket.upload(options);

// upload file (callback version)
FileBucket.upload(options, (err, data) => {
	
	// upload failure
	if(err) {
	
		return console.error(err);
	} 
	
	// upload success
	else {
		
		return console.dir(data);
	}
});
```

Parameters:
-	options
	-	serverUrl - (string) the url of FileBucket server
	-	files - (string|string[]) file path of upload file(s)
	-	key - (string) an api key for FileBucket server
-	callback - (function) a callback function (no callback provided will consider as promise mode)
	-	err - (object) a error object if error occure
	-	data - (object) a data object if upload success