// native
var path = require('path');

// internal
var DomFile = require('./lib/dom-file');

/**
 * Object that represents the filesystem
 * @param {[type]} root    [description]
 * @param {[type]} options [description]
 */
var DomFs = function (root, options) {

	// root of the filesystem
	this.root = root;

	// object to hold the file
	this.files = {};
};

/**
 * Creates a file object
 * @param  {[type]} fileRelativePath [description]
 * @return {[type]}                  [description]
 */
DomFs.prototype.getFile = function (fileRelativePath) {

	var fullPath = path.join(this.root, fileRelativePath);

	if (!this.files[fullPath]) {
		this.files[fullPath] = new DomFile(fullPath);
	}

	return this.files[fullPath];
};

module.exports = DomFs;