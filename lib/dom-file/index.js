// native
var path = require('path');
var fs   = require('fs');

// third-party
var q        = require('q');
var DomUtils = require('domutils');
var _        = require('lodash');
var beautify = require('js-beautify').html_beautify;

// internal dependencies
var buildDom = require('./build-dom'),
	aux      = require('./auxiliary');

// denodeified functions
var readFile = q.denodeify(fs.readFile),
	writeFile = q.denodeify(fs.writeFile);

/**
 * The constructor :)
 * @param {[type]} filePath [description]
 */
var DomFile = function (filePath) {

	// assign basic properties
	this.path = filePath;

	// syncrhonous reading, as asynchronous would make 
	// all further operations (dom building, element getting)
	// have to be asynch as well.
	// In order to maintain API simplicity and ease of use, we'll use the 
	// synchronous version.
	var contents = fs.readFileSync(filePath, { encoding: 'utf8' });

	// build dom tree from file contents
	var dom = buildDom(contents);

	// save reference to dom.
	this.dom = dom;
};

DomFile.prototype.getElementByCharPosition = function (charPosition) {

};

DomFile.prototype.getElementByUID = function (uid) {

};

DomFile.prototype.getElementByXPath = function (xPath) {

	// use DomUtils.findOne(testFn, DomTree)
	return DomUtils.findOne(function (element) {
		// compare the element's xPath with the required xPath
		return element.getXPath() === xPath;
	}, this.dom);
};

/**
 * [stringify description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
DomFile.prototype.stringify = function (options) {
	options = options || {};

	// callback to be executed on each element of the dom tree
	// before stringification
	var elementCallback = _.isFunction(options) ? options : options.elementCallback;

	// clone the original dom object
	// in order not to alter the dom for stringification
	var clonedDom = _.cloneDeep(this.dom);

	// walk it
	if (elementCallback) {
		aux.walkDom(clonedDom, function (element) {
			elementCallback(element, clonedDom);
		});
	}
	// stringify and return
	return DomUtils.getOuterHTML(clonedDom);
};

/**
 * Writes the DOM to the file.
 * @return {[type]} [description]
 */
DomFile.prototype.write = function (options) {

	options = options || {};

	// set some defaults
	_.defaults(options, {
		path: this.path,
		mode: '777',
		encoding: 'utf8',
		elementCallback: false,
	});

	// get html
	var html = this.stringify(options);

	// beautify html
	html = beautify(html);

	// write the file, return promise
	return fs.writeFileSync(options.path, html, options);
};

// export
module.exports = DomFile;

// auxiliary
DomFile.aux = aux;