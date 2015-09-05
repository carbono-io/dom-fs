'use strict';

/**
 * Retrieves the element xPath
 * @param  {Object} element - element whose xpath should be returned.
 * @return {string} xpath of element.
 */
function getElementXPath(element) {

    var paths = [];

    for (; element && element.type === 'tag'; element = element.parent) {
        var index = 0;

        for (var sibling = element.prev; sibling; sibling = sibling.prev) {
            if (sibling.type !== 'tag') {
                continue;
            } else if (sibling.name === element.name) {
                ++index;
            }
        }

        var pathIndex = (index ? '[' + (index + 1) + ']' : '');
        paths.splice(0, 0, element.name + pathIndex);
    }

    return paths.length ? '/' + paths.join('/') : null;
}

/**
 * Walks all the dom tree
 * @param  {Object[]} elements - elements from which to walk the dom tree.
 * @param  {Function} callback - function called at each dom element.
 */
function walkDom(elements, callback) {
    for (var i = 0; i < elements.length; i++) {
        var currEl = elements[i];

        callback(currEl);

        if (currEl.type === 'tag' && currEl.children.length > 0) {
            walkDom(currEl.children, callback);
        }
    }
}

exports.getElementXPath = getElementXPath;
exports.walkDom = walkDom;
