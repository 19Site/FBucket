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

const App = new Koa();

const Router = new KoaRouter();

/**
 * start server
 */
const start = async (config) => {

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
		assetUrl: typeof config.assetUrl === 'string' ? config.assetUrl : 'http://www.example.com:60080'
	};

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
	 * do-upload
	 */
	Router.post('/v1/do-upload', async ctx => {

		try {

			// uploaded files
			var files = ctx.request.files;

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
				var basePath = Path.join(__dirname, 'public', 'files');

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

				// rewrite data
				filesContainer[i] = {

					...filesContainer[i],

					url: config.assetUrl + filePath.replace(basePath, ''),

					path: filePath.replace(basePath, ''),

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

	// use logger
	App.use(KoaLogger());

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
	App.use(KoaStatic(Path.join(__dirname, 'public', 'files')));

	// add router
	App.use(Router.routes()).use(Router.allowedMethods());

	// start server (HTTP)
	Http.createServer(App.callback()).listen(config.portHttp, () => {

		console.log('HTTP server started at port ' + config.portHttp);
	});

	// enable https
	if (config.enableHttps) {

		// https options
		var httpsOptions = {

			key: Fs.readFileSync(config.sslKeyFile),

			cert: Fs.readFileSync(config.sslCertFile)
		};

		// start server (HTTPS)
		Https.createServer(httpsOptions, App.callback()).listen(config.portHttps, () => {

			console.log('HTTPS server started at port ' + config.portHttps);
		});
	}
};

/**
 * send file to file api server
 */
const upload = async (serverUrl, paths, callback) => {

	/**
	 * send success
	 */
	var sendSuccess = (data, resolve) => {

		if (typeof callback === 'function') {

			return callback(undefined, data);
		} else {

			return resolve(data);
		}
	}

	/**
	 * send 
	 */
	var sendError = (error, reject) => {

		if (typeof callback === 'function') {

			return callback(error);
		} else {

			return reject(error);
		}
	}

	// create promise
	return new Promise((resolve, reject) => {

		// no server url
		if (typeof serverUrl !== 'string') {

			// send error
			return sendError(new Error('invalid server url'), reject);
		}

		// invalid file paths
		if (typeof paths !== 'string' && typeof paths !== 'object' && typeof paths.length !== 'number') {

			// send error
			return sendError(new Error('invalid file paths'), reject);
		}

		// paths is not an array
		if (typeof paths === 'string') {

			// to array
			paths = [paths];
		}

		// check array (contain non string elements)
		if (paths.filter(i => typeof i !== 'string').length > 0) {

			// send error
			return sendError(new Error('file paths contains non string elements'), reject);
		}

		// trim last slash
		serverUrl = serverUrl.replace(/\/*$/, '');

		// result
		var result = {};

		// jobs
		var jobs = [];

		// form data
		var formData = new FormData();

		// loop all paths
		paths.forEach(path => {

			// check file is exists
			jobs.push(next => Fs.access(path, err => next(err)));
		});

		// loop all paths
		paths.forEach(path => {

			// check file is exists
			jobs.push(next => {

				// add file path
				formData.append('f', Fs.createReadStream(path));

				// next
				return next(undefined);
			});
		});

		// do upload
		jobs.push(next => {

			// request config
			var requestConfig = {

				data: formData,

				method: 'POST',

				url: serverUrl + '/v1/do-upload',

				headers: {

					...formData.getHeaders()
				}
			};

			// call axios
			return Axios(requestConfig)

				.then(data => {

					// save data
					result = data.data.data;

					// do next
					return next(undefined);

				}, err => next(err))
		});

		// do job
		Async.waterfall(jobs, err => {

			// error
			if (err) {

				return sendError(err, reject);
			}

			// success
			else {

				return sendSuccess(result, resolve);
			}
		});
	});
};

// import module
if (typeof module === 'object' && module.parent === null) {

	// run server
	start().then(() => {}).catch(err => {

		// print error
		console.error(err);
	});
}

// export methods
else if (typeof module === 'object') {

	module.exports = {

		start,

		upload
	};
}