var path = require('path');

var should = require('should'),
	_      = require('lodash'),
	q      = require('q');

var DomFs = require('../');


describe('DomFs', function(){
	it('.getFile()', function(testDone) {

		var dfs = new DomFs(path.join(__dirname, 'html-files'));

		var file = dfs.getFile('index.html');

		file.buildDom()
			.then(function (dom) {
				console.log(dom);

				testDone();
			})
			.done()
	});

	it ('.createNewPage()', function(testDone) {
		var dfs = new DomFs(__dirname);
		var createPagePromise = dfs.createNewPage({name: 'lista_de_blusas', label: 'lista de blusas'});

		createPagePromise.then(function() {
			testDone();
		}, function(err) {
			console.log(err);
			testDone();
		});
	});
});