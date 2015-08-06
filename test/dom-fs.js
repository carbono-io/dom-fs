var path = require('path');

var should = require('should'),
	_      = require('lodash'),
	q      = require('q');

var DomFs = require('../');


describe('DomFs', function(){
	it('.getFile()', function() {

		var dfs = new DomFs(path.join(__dirname, 'html-files'));

		var file = dfs.getFile('index.html');

		file.dom.should.be.type('object');
	});
});