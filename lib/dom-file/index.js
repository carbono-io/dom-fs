'use strict';
var fs   = require('fs');

var DomUtils = require('domutils');
var _        = require('lodash');
var beautify = require('js-beautify').html;

var buildDom = require('./build-dom');
var aux      = require('./auxiliary');

/**
 * The constructor :)
 * @param {string} filePath - path of the file.
 */
var DomFile = function (filePath) {

    this.path = filePath;

    // Synchronous reading, as asynchronous would make
    // all further operations (dom building, element getting)
    // have to be asynch as well.
    // In order to maintain API simplicity and ease of use, we'll use the
    // synchronous version.
    var contents = fs.readFileSync(filePath, { encoding: 'utf8' });

    var dom = buildDom(contents);

    this.dom = dom;
};

DomFile.prototype.getElementByCharPosition = function (charPosition) {
    console.log(charPosition);
};

DomFile.prototype.getElementByUID = function (uid) {
    console.log(uid);
};

DomFile.prototype.getElementByXPath = function (xPath) {
    return DomUtils.findOne(function (element) {
        return element.getXPath() === xPath;
    }, this.dom);
};

/**
 * Serializes the dom tree into a string.
 * @param  {(Object|Function)} options - used to provide the callback for all
 *                              dom elements.
 * @return {string} the serialized HTML.
 */
DomFile.prototype.stringify = function (options) {
    options = options || {};

    var elementCb = _.isFunction(options) ? options : options.elementCallback;

    var clonedDom = _.cloneDeep(this.dom);

    if (elementCb) {
        aux.walkDom(clonedDom, function (element) {
            elementCb(element, clonedDom);
        });
    }
    return DomUtils.getOuterHTML(clonedDom);
};

/**
 * Writes the DOM to the file.
 */
DomFile.prototype.write = function (options) {

    options = options || {};

    _.defaults(options, {
        path: this.path,
        mode: '777',
        encoding: 'utf8',
        elementCallback: false,
    });

    var html = this.stringify(options);

    html = beautify(html);

    return fs.writeFileSync(options.path, html, options);
};

module.exports = DomFile;

DomFile.aux = aux;
