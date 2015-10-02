'use strict';
require('chai').should();

var DomFile = require('../lib/dom-file');

describe('DomFile', function () {
    describe('.buildDom()', function () {
        it('build the dom', function () {
            var file = new DomFile(__dirname + '/html-files/index.html');

            var dom = file.dom;
            dom.should.not.be.empty;
            dom.should.have.property('length');
        });
    });

    describe('.getElementByUuid()', function () {
        it('retrieves the element referenced by a given uuid', function () {
            var file = new DomFile(__dirname + '/html-files/index.html');
            var uuid = file.dom[0].uuid;

            var element = file.getElementByUuid(uuid);
            element.should.be.an('object');
            element.type.should.eql('tag');
            element.name.should.eql('html');
            element.uuid.should.eql(uuid);
        });
    });

    describe('.getElementByXPath()', function () {
        it('retrieves the element at given xPath', function () {
            var file = new DomFile(__dirname + '/html-files/index.html');

            var element = file.getElementByXPath('/html/head');

            element.should.be.an('object');
            element.type.should.eql('tag');
            element.name.should.eql('head');
        });
    });

    describe.skip('.removeElementAtXPath()', function () {
        it('Removes an element and its children from the DOM', function (done) {
            var file = new DomFile(__dirname + '/html-files/index.html');

            file.removeElementAtXPath('/html/body/div[2]/a')
                .then(function () {
                    file.write().then(function () {
                        done();
                    });
                });
        });
    });

    describe('.stringify(elementCallback)', function () {
        it('test', function () {
            var file = new DomFile(__dirname + '/html-files/index.html');

            function elementCallback(element) {
                if (element.type === 'tag') {
                    element.attribs.xPath = element.getXPath();
                }
            }

            var dirtyHtml = file.stringify(elementCallback);
            var cleanHtml = file.stringify();
            dirtyHtml.should.be.a('string');
            cleanHtml.should.be.a('string');
        });
    });

    describe('.write(options)', function () {
        it('write to another file', function () {
            var file = new DomFile(__dirname + '/html-files/index.html');

            var writeOptions = {
                path: __dirname + '/html-files/index.marked.html',
                elementCallback: function (el) {
                    if (el.type === 'tag') {

                        if (el.getXPath() === '/html/body') {
                            el.addChild('<div id="lalala"></div>');
                        }

                        el.attribs['data-x-path'] = el.getXPath();
                    }
                },
            };

            file.write(writeOptions);

        });
    });
});
