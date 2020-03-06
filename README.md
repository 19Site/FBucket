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

Config:  
-	portHttp - (number) port number for HTTP (default: 60080)
- 	ortHttps - (number) port number for HTTPS (default: 60443)
-	enableHttps - (boolean) is enable HTTPS server (default: true)
-	sslKeyFile - (String) path to ssl key file (for HTTPS server) (default: path to a self-signed key)
-	sslCertFile - (String) path to ssl cert file (for HTTPS server) (default: path to a self-signed cert)
-	assetUrl - (String) a url that prepend to uploaded file (default: www.example.com)

### FileBucket.upload(serverUrl, files, callback)

API for upload file to FileBucket server.

```js
// upload file (promise version)
var data = await FileBucket.upload('https://www.mydomain.com', 'path_to_file.jpg');

// upload file (callback version)
FileBucket.upload('https://www.mydomain.com', 'path_to_file.jpg', (err, data) => {
	
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
-	serverUrl - (string) the url of FileBucket server
-	files - (string|string[]) file path of upload file(s)
-	callback - (function) a callback function (no callback provided will consider as promise mode)
	-	err - (object) a error object if error occure
	-	data - (object) a data object if upload success
