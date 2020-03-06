'use strict';

const Path = require('path');

const FBucket = require('./app.js');

(async () => {

	// start server
	await FBucket.startServer({

		apiKey: 'api-key'
	});

	// upload file
	var data = await FBucket.putFile({

		serverUrl: 'http://localhost:60080',

		files: 'app.js',

		key: 'api-key'
	});

	// show result
	console.dir(data);

	// exit
	process.exit();

})().catch(err => console.error(err));