'use strict';
var htmlparser2 = require('htmlparser2');
var DomHandler  = require('domhandler');
var _           = require('lodash');

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

        /* @todo give elements unique ids.
         * element.uid = _.uniqueId();
         */
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
        xpath: this.getXPath(),
        content: null,
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
        xpath: this.getXPath(),
        content: null,
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
 * @param {(Object|string)[]} elements - child or children to insert. may be
 *                      provided as a string, an object, or an array of objects.
 * @param {?Object} options - insertion options.
 * @param {?boolean} options.before - item(s) should be inserted before others.
 * @param {?boolean} options.after - item(s) should be inserted after others.
 */
elementMethods.addChildren = function (elements, options) {

    elements = _.isString(elements) ? buildDom(elements) : elements;

    elements = _.isArray(elements) ? elements : [elements];

    var insertBefore = options && options.before ? options.before : false;
    var insertAfter  = options && options.after ? options.after : false;

    if (insertBefore) {
        elements.forEach(function (el) {

            /* The referenceIndex needs to be recalculated in each addition as
             * the index of the referenceElement will change at each insertion.
             */
            var referenceIndex = this._getChildIndex(insertBefore);

            el.parent = this;
            this.children.splice(referenceIndex, 0, el);
        }, this);

    } else if (insertAfter) {
        var referenceIndex = this._getChildIndex(insertAfter);

        elements.forEach(function (el) {
            el.parent = this;
            this.children.splice(referenceIndex + 1, 0, el);
        }, this);

    } else {
        elements.forEach(function (el) {
            el.parent = this;
            this.children.push(el);
        }, this);
    }

    var eventContent = {
        xpath: this.getXPath(),
        content: null,
    };

    this.notifyUpdate(eventContent);

    return this;
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
        xpath: this.getXPath(),
        content: null,
    };

    this.domFile.emit('update', eventContent);
};

module.exports = buildDom;
