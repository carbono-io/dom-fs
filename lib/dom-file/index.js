// native
var path = require('path'),
	fs   = require('fs');

// third-party
var q        = require('q'),
	DomUtils = require('domutils'),
	_        = require('lodash'),
	beautify = require('js-beautify').html_beautify;

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

	// property to hold all promises of the object
	this.promises = {};
};

/**
 * Read the file
 * @return {[type]} [description]
 */
DomFile.prototype.read = function (force) {

	if (!this.promises.read || force) {
		this.promises.read = readFile(this.path, {
			encoding: 'utf8'
		});
	}

	// always return the promise
	return this.promises.read;
};

/**
 * Build the dom
 * @return {[type]} [description]
 */
DomFile.prototype.buildDom = function (force) {

	if (!this.promises.buildDom || force) {

		// get the read promise
		var readPromise = this.read(force);

		// first read the file
		this.promises.buildDom = readPromise.then(function (sourceHtml) {
			return buildDom(sourceHtml);
		});
	}

	// always return the promise
	return this.promises.buildDom;
};

/**
 * Retrieves the element at a given xPath position
 * @param  {[type]} xPath [description]
 * @return {[type]}       [description]
 */
DomFile.prototype.getElementAtXPath = function (queriedXPath) {

	// build the dom
	return this.buildDom().then(function (dom) {

		// use DomUtils.findOne(testFn, DomTree)
		return DomUtils.findOne(function (element) {

			// compare the element's xPath with the required xPath
			return aux.getElementXPath(element) === queriedXPath;

		}, dom);

	})

};

DomFile.prototype.changeSource = function(oldSource, newSource) {
	var deferred = q.defer();

	this.buildDom().then(function(dom) {

		// Traverse it looking for tags that have the fab-source attribute.
		// For those who have this attribute and the table name in its value
		// is equal to "oldSource", we'll change it to "newSource"
		aux.walkDom(dom, function (element) {
			
			// First let's check if we're dealing with a tag
			if (element.hasOwnProperty('attribs')) {
				if (element.attribs.hasOwnProperty('fab-source')) {
					/*
					 * Now it's a bit tricky. Suppose there's a div
					 * fab-source="http://localhost:3103/gallery_123456789".
					 * If we do element.attribs['fab-source'].indexOf('gallery_123456789')
					 * it would find it. But it would find 'gallery_123', and it's not
					 * the same table. So we need to do is: since we know that the
					 * table name will come after the last /, we need to split the url
					 * by its slashes and get the last element of the resulting array.
					 * this last element SHOULD be the name of the table.
					 */
					var splitArray = element.attribs['fab-source'].split('/');
					var currentSource = splitArray[splitArray.length - 1];

					if (currentSource === oldSource) {
						element.attribs['fab-source'] = element.attribs['fab-source'].replace(oldSource, newSource);
					}
				}
			}
		});

		deferred.resolve();
	});

	return deferred.promise;
}

/**
 * Retrieves an element at an index of the file.
 * @param  {[type]} index [description]
 * @return {[type]}       [description]
 */
DomFile.prototype.getElementAtIndex = function (index) {

};

/**
 * [stringify description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
DomFile.prototype.stringify = function (options) {

	// keep reference to the file
	var domFileObject = this;

	options = options || {};

	// callback to be executed on each element of the dom tree
	// before stringification
	var elementCallback = _.isFunction(options) ? options : options.elementCallback;

	return this.buildDom()
		.then(function (dom) {

			// clone the original dom object
			var clonedDom = _.cloneDeep(dom);

			// walk it
			if (elementCallback) {
				aux.walkDom(clonedDom, function (element) {
					elementCallback(element, domFileObject);
				});
			}
			// stringify and return
			return DomUtils.getOuterHTML(clonedDom);
		});
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

	return this.stringify(options)
		.then(function (html) {

			html = beautify(html);

			return writeFile(options.path, html, options);
		});
};

// export
module.exports = DomFile;

// auxiliary
DomFile.aux = aux;