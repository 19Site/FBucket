'use strict';

const Fs = require('fs');

const Async = require('async');

const Path = require('path');

const Koa = require('koa');

const KoaMount = require('koa-mount');

const KoaStatic = require('koa-static');

const KoaCompress = require('koa-compress');

const KoaBody = require('koa-body');

const KoaLogger = require('koa-logger');

const KoaRouter = require('koa-router');

const Http = require('http');

const Https = require('https');

const Axios = require('axios');

const Qs = require('qs');

const ZLib = require('zlib');

const Moment = require('moment');

const Mime = require('mime-types');

const FormData = require('form-data');

const Url = require('url');

const App = new Koa();

const Router = new KoaRouter();

/**
 * start server
 */
const startServer = async (config, callback) => {

	// check config
	config = config || {};

	config = {

		// port http
		portHttp: typeof config.portHttp === 'number' ? config.portHttp : 60080,

		// port https
		portHttps: typeof config.portHttps === 'number' ? config.portHttps : 60433,

		// enable https
		enableHttps: config.enableHttps !== false,

		// ssl key file path
		sslKeyFile: typeof config.sslKeyFile === 'string' ? config.sslKeyFile : Path.join(__dirname, 'ssl', 'www.example.com.key'),

		// ssl cert file path
		sslCertFile: typeof config.sslCertFile === 'string' ? config.sslCertFile : Path.join(__dirname, 'ssl', 'www.example.com.cert'),

		// asset url (public domain / IP)
		assetUrl: typeof config.assetUrl === 'string' ? config.assetUrl : 'http://www.example.com:60080',

		// local directory
		localDirectory: typeof config.localDirectory === 'string' ? config.localDirectory : Path.join(__dirname, 'public', 'files'),

		// key for api protection
		apiKey: typeof config.apiKey === 'string' ? config.apiKey : undefined,

		// enable console log
		enableLog: config.enableLog !== false,

		// callback
		callback: typeof callback === 'function' ? callback : undefined
	};

	// result
	var result = {};

	// check local file path is exists
	Fs.accessSync(config.localDirectory);

	/**
	 * testing link
	 */
	Router.get('/', async ctx => {

		// response
		return ctx.body = {

			ok: true
		};
	});

	/**
	 * post files (create new file)
	 */
	Router.post('/files', async ctx => {

		try {

			// fields
			var fields = ctx.request.body;

			// uploaded files
			var files = ctx.request.files;

			// check api key
			if (typeof config.apiKey !== 'undefined' && config.apiKey !== fields.key) {

				// invalid api key
				throw new Error('invalid api key');
			}

			// asset url
			var assetUrl = config.assetUrl.replace(/\/*$/, '');

			// files container
			var filesContainer = [];

			// loop all files
			for (var i in files) {

				// upload field name
				var fieldName = i;

				// uplaod field item
				var item = files[i];

				// item is array
				if (Array.isArray(item)) {

					// loop all files in same field
					for (var j in item) {

						// file object
						var fileObject = item[j];

						// add to file container
						filesContainer.push({

							field: i,

							size: fileObject.size,

							path: fileObject.path,

							name: fileObject.name,

							type: fileObject.type,

							mtime: fileObject.mtime
						});
					}
				}

				// item is single file
				else {

					// add to file container
					filesContainer.push({

						field: i,

						size: item.size,

						path: item.path,

						name: item.name,

						type: item.type,

						mtime: item.mtime
					});
				}
			}

			// loop each upload files
			for (var i in filesContainer) {

				// file
				var fileObject = filesContainer[i];

				// base name
				var name = Math.random().toString(16).slice(2).substring(0, 8) + '-' + Math.random().toString(16).slice(2).substring(0, 4) + '-' + Math.random(16).toString().slice(2).substring(0, 4) + '-' + Math.random().toString(16).slice(2).substring(0, 4) + '-' + Math.random().toString(16).slice(2).substring(0, 12);

				// final file name
				var uploadFileName = name + '.' + Mime.extension(fileObject.type);

				// upload base path
				var basePath = config.localDirectory;

				// upload path
				var filePath = basePath;

				try {

					// create first stack file structure
					filePath = Path.join(filePath, name.substring(0, 2));

					// create folder
					Fs.mkdirSync(filePath);

				} catch (err) {}

				try {

					// create second stack file structure
					filePath = Path.join(filePath, name.substring(2, 4));

					// create folder
					Fs.mkdirSync(filePath);

				} catch (err) {}

				try {

					// write uploaded file to new location
					filePath = Path.join(filePath, uploadFileName);

					// move file
					Fs.renameSync(fileObject.path, filePath);

				} catch (err) {

					// to prevent cross device write error
					await new Promise((resolve, reject) => {

						var RS = Fs.createReadStream(fileObject.path);

						var WS = Fs.createWriteStream(filePath);

						RS.pipe(WS);

						RS.on('error', err => {

							Fs.unlinkSync(fileObject.path);

							return reject();
						});

						RS.on('end', () => {

							Fs.unlinkSync(fileObject.path);

							return resolve();
						});
					})
				}

				// file url
				var url = new Url.URL(assetUrl + filePath.replace(basePath, '')).toString();

				// rewrite data
				filesContainer[i] = {

					...filesContainer[i],

					path: url.replace(assetUrl, ''),

					url: url,

					originalName: filesContainer[i].name,

					name: uploadFileName
				};
			}

			// response
			return ctx.body = {

				ok: true,

				data: filesContainer
			};
		}

		// error
		catch (err) {

			// response
			return ctx.body = {

				ok: false,

				error: err.message
			};
		}
	});

	// enable log
	if (config.enableLog) {

		// use logger
		App.use(KoaLogger());
	}

	// use body
	App.use(KoaBody({

		jsonLimit: '5mb',

		multipart: true
	}));

	// use gzip
	App.use(KoaCompress({

		flush: ZLib.Z_SYNC_FLUSH
	}));

	// use router
	App.use(KoaStatic(config.localDirectory));

	// add router
	App.use(Router.routes()).use(Router.allowedMethods());

	// jobs
	var jobs = [];

	// start http server
	jobs.push(next => {

		// start server (HTTP)
		var server = Http.createServer(App.callback());

		// add to result
		result = {

			...result,

			servers: {

				...result.servers,

				http: server
			}
		};

		// listen
		server.listen(config.portHttp, () => {

			// enable log
			if (config.enableLog) {

				console.log('HTTP server started at port ' + config.portHttp);
			}

			// do next
			return next(undefined);
		});
	});

	// enable https
	if (config.enableHttps) {

		// start https server
		jobs.push(next => {

			// https options
			var httpsOptions = {

				key: Fs.readFileSync(config.sslKeyFile),

				cert: Fs.readFileSync(config.sslCertFile)
			};

			// start server (HTTPS)
			var server = Https.createServer(httpsOptions, App.callback());

			// add to result
			result = {

				...result,

				servers: {

					...result.servers,

					https: server
				}
			};

			// listen
			server.listen(config.portHttps, () => {

				// enable log
				if (config.enableLog) {

					console.log('HTTPS server started at port ' + config.portHttps);
				}

				// do next
				return next(undefined);
			});
		});
	}

	// return promise
	return new Promise((resolve, reject) => {

		// do job
		Async.waterfall(jobs, err => {

			if (err) {

				if (typeof callback === 'function') {

					return config.callback(err);
				} else {

					return reject(err);
				}
			} else {

				if (typeof callback === 'function') {

					return config.callback(undefined, result);
				} else {

					return resolve(result);
				}
			}
		});
	});
};

/**
 * put file to file api server
 */
const putFile = async (options, callback) => {

	// check input
	options = options || {};

	options = {

		serverUrl: typeof options.serverUrl === 'string' ? options.serverUrl : undefined,

		files: typeof options.files === 'string' ? [options.files] : (Array.isArray(options.files) ? options.files : undefined),

		key: typeof options.key === 'string' ? options.key : undefined,

		callback: typeof callback === 'function' ? callback : undefined
	};

	// result
	var result = {};

	// jobs
	var jobs = [];

	// check input
	jobs.push(next => {

		// server url
		if (typeof options.serverUrl === 'undefined') {

			return next(new Error('invalid server url'));
		}

		// files
		if (typeof options.files === 'undefined') {

			return next(new Error('invalid files'));
		}

		// check array (contain non string elements)
		if (options.files.filter(i => typeof i !== 'string').length > 0) {

			return next(new Error('files contains non string elements'));
		}

		// trim last slash
		options.serverUrl = options.serverUrl.replace(/\/*$/, '');

		// do next
		return next(undefined);
	});

	// check files exists
	jobs.push(next => {

		var jobs = [];

		// check each file
		options.files.forEach(path => jobs.push(next => Fs.access(path, err => next(err))));

		// do check
		Async.waterfall(jobs, err => next(err));
	});

	// request to API
	jobs.push(next => {

		// form data
		var formData = new FormData();

		// add file to form data
		options.files.forEach(path => formData.append('f', Fs.createReadStream(path)));

		// add api key to request
		if (typeof options.key === 'string') {

			formData.append('key', options.key);
		}

		// request config
		var requestConfig = {

			data: formData,

			method: 'POST',

			url: options.serverUrl + '/files',

			headers: {

				...formData.getHeaders()
			}
		};

		// call axios
		return Axios(requestConfig)

			.then(data => {

				// save data
				var resData = data.data;

				// request ok
				if (resData.ok) {

					// save result
					result = data.data.data;

					// do next
					return next(undefined);
				}

				// request failure
				else {

					return next(new Error(resData.error));
				}

			}, err => next(new Error(err.message)))
	});

	// create promise
	return new Promise((resolve, reject) => {

		// do job
		Async.waterfall(jobs, err => {

			// error
			if (err) {

				if (typeof options.callback === 'function') {

					return options.callback(err);
				} else {

					return reject(err);
				}
			}

			// success
			else {

				if (typeof options.callback === 'function') {

					return options.callback(undefined, result);
				} else {

					return resolve(result);
				}
			}
		});
	});
};

// import module
if (typeof module === 'object' && module.parent === null) {

	// start server
	startServer().catch(err => console.error(err));
}

// export methods
else if (typeof module === 'object') {

	module.exports = {

		startServer,

		putFile
	};
}