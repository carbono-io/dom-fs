var path = require('path');

var should = require('should');
var _      = require('lodash');
var q      = require('q');

var DomFs = require('../');


describe('DomFs', function(){
    it('.getFile()', function() {

        var dfs = new DomFs(path.join(__dirname, 'html-files'));

        var file = dfs.getFile('index.html');

        file.dom.should.be.type('object');
    });

    it ('.createNewPage()', function(testDone) {
        var dfs = new DomFs(__dirname);
        var createPagePromise = dfs.createNewPage({name: 'lista_de_blusas', label: 'lista de blusas'});

        createPagePromise.then(function() {
            testDone();
        }, function(err) {
            console.log(err);
            testDone();
        });
    });
});
