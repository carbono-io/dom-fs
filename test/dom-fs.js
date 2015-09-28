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

    it('Must emit notifications on file updates', function (done) {
        var dfs = new DomFs(path.join(__dirname, 'html-files'));
        var filename = 'index.html';
        var xpath = '/html/head';

        var file = dfs.getFile(filename);
        var element = file.getElementByXPath(xpath);

        dfs.on('update', function (data) {
            data.file.should.eql(filename);
            data.element.uuid.should.eql(element.uuid);
            done();
        });

        element.addChildren({type: 'tag', name: 'p'});
    });
});
