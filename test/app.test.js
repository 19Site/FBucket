'use strict';

const Async = require('async');

const Axios = require('axios');

const Fs = require('fs');

const FormData = require('form-data');

const Path = require('path');

const App = require(Path.join(__dirname, '..', 'app.js'));

const expect = require('chai').expect;

// full application test
describe('Application test', () => {

	// api key
	var apiKey = Math.random().toString(16).slice(2);

	// server
	var server = 'http://localhost:60080';

	// server data
	var serverData = undefined;

	// server config
	var serverConfig = {

		enableLog: false,

		apiKey: apiKey
	};

	// start server
	before(done => {

		// start server
		App.startServer(serverConfig, (err, r) => {

			// assign server data
			serverData = {

				...r
			};

			// done
			return done();
		});
	});

	// close server
	after(done => {

		// jobs
		var jobs = [];

		// close http server
		jobs.push(next => serverData.servers.http.close(next));

		// close https server
		jobs.push(next => serverData.servers.https.close(next));

		// done
		return Async.waterfall(jobs, err => done());
	});

	// test server
	describe('Start server', () => {

		// check server has return right params
		it('Server return right objects', done => {

			// has servers object
			expect(serverData.servers).to.be.a('object');

			// has created http server
			expect(serverData.servers.http).to.be.a('object');

			// has created https server
			expect(serverData.servers.https).to.be.a('object');

			// done
			return done();
		});
	});

	// rest api test
	describe('Test NodeJS Client', () => {

		// test invalid api key
		it('Test invalid api key', done => {

			// call method
			App.putFile({

				serverUrl: server,

				files: __filename,

				key: 'invalid api key'

			}, (err, r) => {

				// has error
				expect(err).to.be.a('error');

				// error message
				expect(err.message).to.be.a('string');

				// right error message
				expect(err.message).to.equal('invalid api key');

				// done
				return done();
			});
		});

		// upload single file
		it('Upload single file', done => {

			// call method
			App.putFile({

				serverUrl: server,

				files: __filename,

				key: apiKey

			}, (err, r) => {

				// no error
				expect(err).to.be.a('undefined');

				// has r object
				expect(r).to.be.a('array').with.lengthOf(1);

				// check each object
				for (var i in r) {

					var f = r[i];

					expect(f).to.be.a('object');

					expect(f.size).to.be.a('number');

					expect(f.path).to.be.a('string');

					expect(f.name).to.be.a('string');

					expect(f.type).to.be.a('string');

					expect(f.url).to.be.a('string');

					expect(f.originalName).to.be.a('string');
				}

				// done
				return done();
			});
		});

		// upload multiple files
		it('Upload multiple files', done => {

			var files = [];

			// no of files
			var noOfFiles = Math.round(Math.random() * 3) + 2;

			// add files
			for (var i = 1; i <= noOfFiles; ++i) {

				// add files
				files.push(__filename);
			}

			// call method
			App.putFile({

				serverUrl: server,

				files: files,

				key: apiKey

			}, (err, r) => {

				// no error
				expect(err).to.be.a('undefined');

				// has r object
				expect(r).to.be.a('array').with.lengthOf(noOfFiles);

				// check each object
				for (var i in r) {

					var f = r[i];

					expect(f).to.be.a('object');

					expect(f.size).to.be.a('number');

					expect(f.path).to.be.a('string');

					expect(f.name).to.be.a('string');

					expect(f.type).to.be.a('string');

					expect(f.url).to.be.a('string');

					expect(f.originalName).to.be.a('string');
				}

				// done
				return done();
			});
		});
	});

	// rest api test
	describe('Test Rest API', () => {

		// get /
		describe('GET /', () => {

			// load balancer testing url
			it('Load balancer testing url', done => {

				// request
				Axios.get(server + '/').then(r => {

					expect(r).to.be.a('object');

					expect(r.data).to.be.a('object');

					r = r.data;

					expect(r.ok).to.be.a('boolean');

					expect(r.ok).to.equal(true);

					return done();
				});
			});
		});

		// post /files
		describe('POST /files', () => {

			// test invalid api key
			it('Test invalid api key', done => {

				// request
				Axios.post(server + '/files', {

					key: 'invalid api key'

				}).then(r => {

					expect(r).to.be.a('object');

					expect(r.data).to.be.a('object');

					var data = r.data;

					expect(data.ok).to.be.a('boolean');

					expect(data.ok).to.equal(false);

					expect(data.error).to.be.a('string');

					expect(data.error).to.equal('invalid api key');

					return done();
				});
			});

			// testing upload file
			it('Test upload empty file', done => {

				// request
				Axios.post(server + '/files', {

					key: apiKey

				}).then(r => {

					expect(r).to.be.a('object');

					expect(r.data).to.be.a('object');

					var data = r.data;

					expect(data.ok).to.be.a('boolean');

					expect(data.ok).to.equal(true);

					expect(data.data).to.be.a('array').with.lengthOf(0);

					return done();
				});
			});

			// testing upload multiple files
			it('Test upload multiple files', done => {

				// random field name
				var randFieldName = Math.random().toString(16).slice(2);

				// form data
				var formData = new FormData();

				// no of files
				var noOfFiles = Math.round(Math.random() * 3) + 2;

				// add files
				for (var i = 1; i <= noOfFiles; ++i) {

					// add files
					formData.append(randFieldName, Fs.createReadStream(__filename));
				}

				// append api key
				formData.append('key', apiKey);

				// request config
				var requestConfig = {

					data: formData,

					method: 'POST',

					url: server + '/files',

					headers: {

						...formData.getHeaders()
					}
				};

				// request
				Axios(requestConfig).then(r => {

					expect(r).to.be.a('object');

					expect(r.data).to.be.a('object');

					var data = r.data;

					expect(data.ok).to.be.a('boolean');

					expect(data.ok).to.equal(true);

					expect(data.data).to.be.a('array').with.lengthOf(noOfFiles);

					for (var i in data.data) {

						var f = data.data[i];

						expect(f).to.be.a('object');

						expect(f.field).to.be.a('string');

						expect(f.field).to.equal(randFieldName);

						expect(f.size).to.be.a('number');

						expect(f.path).to.be.a('string');

						expect(f.name).to.be.a('string');

						expect(f.type).to.be.a('string');

						expect(f.url).to.be.a('string');

						expect(f.originalName).to.be.a('string');
					}

					return done();
				});
			});
		});
	});
});