// native
var path = require('path');
var fs = require('fs');
var q = require('q');

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

    // TODO: DomFs is not keeping references to open (and possibly edited)
    // DomFiles. With this, all further calls to getFile of a modified and
    // unsaved file will return file objects with unmodified content
    
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

    return new DomFile(fullPath);
};

/**
 * Creates a new page in the templates folder
 */
DomFs.prototype.createNewPage = function(pageData) {
    var deferred = q.defer();

    var dir = path.join(this.root, 'www', 'templates');

    /* 
    * First we need to make sure that there is a template folder inside
    * the project's root folder.
    */
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    /*
     * Then, we'll create a new file with a default content.
     */
    var content = '<ion-view view-title=\"' + pageData.label + '\"><ion-content></ion-content></ion-view>';
    fs.writeFile(path.join(this.root, 'www', 'templates', pageData.name + '.html'), content, function(err) {
        if (err) {
            deferred.reject(err);
        }

        deferred.resolve();
    });


    return deferred.promise;
}

// Export the class
module.exports = DomFs;