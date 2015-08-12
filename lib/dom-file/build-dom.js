// external modules
var htmlparser2 = require('htmlparser2');
var DomHandler  = require('domhandler');
var _           = require('lodash');

// internal dependencies
var aux = require('./auxiliary');

// Object to hold the methods of the element object.
// Very sadly, the element methods could not be made independent of
// the build-dom module, due to circular dependencies.
var elementMethods = {};

/**
 * Retrieves the xPath of the context element in the dom tree.
 * @return {[type]} [description]
 */
elementMethods.getXPath = function () {
    return aux.getElementXPath(this);
};

/**
 * Removes all the elements inside this element
 * @return {[type]} [description]
 */
elementMethods.removeChildren = function () {
    this.children.splice(0, this.children.length);
};

/**
 * Edits an attribute of the context element.
 * Ignores if the attribute did previously exist.
 * Ignores editions with 'null' as attributeValue
 * @param  {[type]} attributeName  [description]
 * @param  {[type]} attributeValue [description]
 * @return {[type]}                [description]
 */
elementMethods.editAttribute = function (attributeName, attributeValue) {

    if (attributeValue !== null) {
        this.attribs[attributeName] = attributeValue;
    }

    return this;
};

/**
 * Retrieves the index of an child element.
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
elementMethods._getChildIndex = function (element) {
    return _.indexOf(this.children, element);
};

/**
 * Returns the child at a given index.
 * @param  {[type]} index [description]
 * @return {[type]}       [description]
 */
elementMethods.getChildAt = function (index) {
    return this.children[index];
}

/**
 * Adds a child element to the context element.
 * Optionally takes a reference element before or after which
 * the new element will be added.
 * If no reference element is provided, the new element will be 
 * added to the end of the list of children of the context element.
 * 
 * @param {[type]} element [description]
 * @param {[type]} options [description]
 */
elementMethods.addChildren = function (elements, options) {

    // [1] guarantee the elements argument is an array
    // if elements is a string, convert it into a dom
    elements = _.isString(elements) ? buildDom(elements) : elements;

    // make the elements argument always an array of elementss
    elements = _.isArray(elements) ? elements : [elements];

    // [2] parse referenceElement
    var insertBefore = options && options.before ? options.before : false,
        insertAfter  = options && options.after ? options.after : false;

    if (insertBefore) {
        // loop array of elements
        elements.forEach(function (el) {

            // the referenceIndex needs to be recalculated in each addition
            // as the index of the referenceElement will change at each insertion
            var referenceIndex = this._getChildIndex(insertBefore);

            // set reference to the parent
            el.parent = this;

            // splice the element into the children array
            this.children.splice(referenceIndex, 0, el);
        }, this);

    } else if (insertAfter) {

        var referenceIndex = this._getChildIndex(insertAfter);

        // loop array of elements
        elements.forEach(function (el) {

            // set reference to the parent
            el.parent = this;

            // splice the element into the children array
            this.children.splice(referenceIndex + 1, 0, el);
        }, this);
        
        
    } else {
        // simply add at the end of the children list
        
        elements.forEach(function (el) {

            // set reference to the parent
            el.parent = this;
            
            this.children.push(el);
        }, this);
    }

    return this;
};

/**
 * Removes children elements
 * @return {[type]} [description]
 */
elementMethods.removeChildren = function (elements) {

    if (_.isString(elements)) {
        // Selector.
        // TODO
        throw new Error('removeChildren selector support not yet implemented, sorry :/');
    }

    // make sure it is an array
    elements = _.isArray(elements) ? elements : [elements];

    // find and remove the children
    elements.forEach(function (el) {

        // get index of the element
        var elIndex = this._getChildIndex(el);

        console.log(elIndex);

    }, this);
};

/**
 * [buildDom description]
 * @param  {[type]} htmlSource [description]
 * @return {[type]}            [description]
 */
function buildDom(htmlSource, options) {

    // let options always be and object
    options = options || {};

    // function that adds attributes to the element
    // xpath and file name
    function elementCB(element) {
        // decorate the element with its methods
        _.assign(element, elementMethods);

        // give it an unique id
        // element.uid = _.uniqueId();
    }

    // SEE:
    // https://github.com/fb55/htmlparser2/blob/master/lib/index.js#L39-L43
    // create new handler
    var handler = new DomHandler({
        withStartIndices: true,
        withEndIndices: true
    }, elementCB);

    // create parser usign the newly created handler
    var parser = new htmlparser2.Parser(handler);

    // insert dom into the parser
    parser.end(htmlSource)

    // and return the dom from the handler
    return handler.dom;
}

// export the buildDom function
module.exports = buildDom;
