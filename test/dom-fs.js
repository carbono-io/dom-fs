'use strict';
var path = require('path');
require('chai').should;

var DomFs = require('../');

describe('DomFs', function () {
    it('.getFile()', function () {

        var dfs = new DomFs(path.join(__dirname, 'html-files'));

        var file = dfs.getFile('index.html');

        file.dom.should.not.be.empty;
    });

    it('.createNewPage()', function (done) {
        var dfs = new DomFs(__dirname);
        var createPagePromise = dfs.createNewPage(
            {
                name: 'lista_de_blusas',
                label: 'lista de blusas',
            }
        );

        createPagePromise.then(done, function (err) {
            console.log(err);
            done();
        });
    });
});
