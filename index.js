'use strict';
var path = require('path');
var fs = require('fs');
var q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

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

    EventEmitter.call(this);
};

util.inherits(DomFs, EventEmitter);

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
        var file = new DomFile(fullPath, this.notifyUpdate.bind(this));
        this.files[fileRelativePath] = file;

        // @todo
        // It's probably better to somehow keep the reference to
        // the registered listeners, so that when forceReload is set, we
        // can unregister the listener.

        file.on('update', function (ev) {
            this.notifyUpdate(fileRelativePath, ev.xpath, ev.content);
        }.bind(this));
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

/**
 * Saves current state of all open files to disk.
 */
DomFs.prototype.saveState = function () {
    for (var file in this.files) {
        this.files[file].write();
    }
};

/**
 * Creates an event to notify update in a file.
 * @param {string} file - file in which the update occurred.
 * @param {string} xpath - xpath of the parent element under which the
 *                  update occurred.
 * @param {?(string|Object)} content - content of the update.
 */
DomFs.prototype.notifyUpdate = function (file, xpath, content) {
    var updateEvent = {
        file: file,
        xpath: xpath,
        content: content,
    };

    this.emit('update', updateEvent);
};

module.exports = DomFs;
