'use strict';
var htmlparser2 = require('htmlparser2');
var DomHandler  = require('domhandler');
var _           = require('lodash');
var DomUtils = require('domutils');

var uuid = require('uuid');

var aux = require('./auxiliary');

// Object to hold the methods of the element object.
// Very sadly, the element methods could not be made independent of
// the build-dom module, due to circular dependencies.
var elementMethods = {};

/**
 * [buildDom description]
 */
var buildDom = function (htmlSource, options) {

    options = options || {};

    /* Function that adds attributes to the element (xpath and file name)
     */
    function elementCB(element) {
        _.assign(element, elementMethods);
        _.assign(element, options.extraMethods);

        element.uuid = uuid.v4();
    }

    // SEE:
    // https://github.com/fb55/htmlparser2/blob/master/lib/index.js#L39-L43
    // create new handler
    var handler = new DomHandler({
        withStartIndices: true,
        withEndIndices: true,
    }, elementCB);

    var parser = new htmlparser2.Parser(handler);

    parser.end(htmlSource);

    return handler.dom;
};

/**
 * Retrieves the xPath of the context element in the dom tree.
 * @return {string} element's xpath.
 */
elementMethods.getXPath = function () {
    return aux.getElementXPath(this);
};

/**
 * Removes all the elements inside this element.
 */
elementMethods.removeChildren = function () {
    this.children.splice(0, this.children.length);

    var eventContent = {
        element: this,
    };

    this.notifyUpdate(eventContent);
};

/**
 * Edits an attribute of the context element.
 * Ignores if the attribute did previously exist.
 * Ignores editions with 'null' as attributeValue
 * @param  {string} attributeName - name of attribute to edit.
 * @param  {string} attributeValue - new value for attribute.
 * @return {Object} element.
 */
elementMethods.editAttribute = function (attributeName, attributeValue) {

    if (attributeValue !== null) {
        this.attribs[attributeName] = attributeValue;
    }

    var eventContent = {
        element: this,
    };

    this.notifyUpdate(eventContent);

    return this;
};

/**
 * Retrieves the index of an child element.
 * @param  {Object} element - child element to search for.
 * @return {number} index of child element.
 */
elementMethods._getChildIndex = function (element) {
    return _.indexOf(this.children, element);
};

/**
 * Returns the child at a given index.
 * @param  {number} index - index of desired child.
 * @return {Object} child object at index.
 */
elementMethods.getChildAt = function (index) {
    return this.children[index];
};

/**
 * Adds a child element to the context element.
 * Optionally takes a reference element before or after which
 * the new element will be added.
 * If no reference element is provided, the new element will be
 * added to the end of the list of children of the context element.
 *
 * @param {string} element - child to insert, provided as a string.
 * @param {?Object} options - insertion options.
 * @param {?boolean} options.before - item(s) should be inserted before others.
 * @param {?boolean} options.after - item(s) should be inserted after others.
 */
elementMethods.addChild = function (element, options) {
    if (_.isString(element)) {
        element = buildDom(element)[0];
        element.parent = this;
    } else {
        throw new TypeError('Expected string, got ' + typeof element);
    }

    var insertBefore = options && options.before ? options.before : false;
    var insertAfter  = options && options.after ? options.after : false;
    var referenceIndex;

    if (insertBefore) {
        referenceIndex = this._getChildIndex(insertBefore);
        this.children.splice(referenceIndex, 0, element);

    } else if (insertAfter) {
        referenceIndex = this._getChildIndex(insertAfter);
        this.children.splice(referenceIndex + 1, 0, element);

    } else {
        this.children.push(element);
    }

    var eventContent = {
        element: this,
    };

    this.notifyUpdate(eventContent);

    return element;
};

/**
 * Removes children elements.
 * @param {Object[]} elements - may be an object or array of objects.
 */
elementMethods.removeChildren = function (elements) {

    if (_.isString(elements)) {
        // Selector.
        // TODO
        throw new Error('selector support not yet implemented, sorry :/');
    }

    elements = _.isArray(elements) ? elements : [elements];

    elements.forEach(function (el) {
        var elIndex = this._getChildIndex(el);
        console.log(elIndex);
    }, this);

    var eventContent = {
        element: this,
    };

    this.domFile.emit('update', eventContent);
};

/**
 * Serializes the element's subtree into a string.
 * @param  {(Object|Function)} options - used to provide the callback for all
 *                              dom elements.
 * @return {string} the serialized HTML.
 */
elementMethods.stringify = function (options) {
    options = options || {};

    var elementCb = _.isFunction(options) ? options : options.elementCallback;

    var clonedDom = _.cloneDeep([this]);

    if (elementCb) {
        aux.walkDom(clonedDom, function (element) {
            elementCb(element, clonedDom);
        });
    }
    return DomUtils.getOuterHTML(clonedDom);
};

module.exports = buildDom;
