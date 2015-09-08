'use strict';
var path = require('path');
var fs = require('fs');
var q = require('q');

var DomFile = require('./lib/dom-file');

/**
 * Object that represents the filesystem
 * @param {string} root - path of the root of filesystem.
 * @param {Object} options - options.
 */
var DomFs = function (root, options) {

    // @todo validate if root is a valid directory.
    this.root = root;
    this.options = options;

    this.files = {};
};

/**
 * Creates a file object
 * @param {string} fileRelativePath [description]
 * @param {?boolean} forceReload - forces file to be loaded from disk, even if
 *                      it was already in memory.
 */
DomFs.prototype.getFile = function (fileRelativePath, forceReload) {
    forceReload = forceReload || false;

    if (forceReload || !(fileRelativePath in this.files)) {
        var fullPath = path.join(this.root, fileRelativePath);
        this.files[fileRelativePath] = new DomFile(fullPath);
    }
    return this.files[fileRelativePath];
};

/**
 * Creates a new page in the templates folder
 */
DomFs.prototype.createNewPage = function (pageData) {
    var deferred = q.defer();

    var dir = path.join(this.root, 'www', 'templates');

    /*
    * First we need to make sure that there is a template folder inside
    * the project's root folder.
    */
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    /*
     * Then, we'll create a new file with a default content.
     */
    var filePath = path.join(
            this.root,
            'www',
            'templates',
            pageData.name + '.html'
    );
    var content = '<ion-view view-title=\"';
    content += pageData.label;
    content += '\"><ion-content></ion-content></ion-view>';

    fs.writeFile(filePath, content, function (err) {
        if (err) {
            deferred.reject(err);
        }

        deferred.resolve();
    });

    return deferred.promise;
};

DomFs.prototype.saveState = function () {
    for (var file in this.files) {
        this.files[file].write();
    }
};

module.exports = DomFs;
