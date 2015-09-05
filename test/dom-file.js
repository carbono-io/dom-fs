'use strict';
require('chai').should();
var _      = require('lodash');
var q      = require('q');

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
                            el.addChildren('<div id="lalala"></div>');
                        }

                        el.attribs['data-x-path'] = el.getXPath();
                    }
                },
            };

            file.write(writeOptions);

        });
    });
});

describe('DomElement', function () {
    it('.editAttribute', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/h1');

        element.editAttribute('data-some-attribute', 'some value');
        element.attribs['data-some-attribute'].should.eql('some value');
    });

    it('.addChildren(element)', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/div');

        element.addChildren({
            type: 'tag',
            name: 'p',
        });
        _.last(element.children).name.should.eql('p');
    });

    it('.addChildren("<div><h1>ola</h1><p>falou</p></div>")', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var htmlString = [
            '<div>',
                '<h1>ola</h1>',
                '<p>falou</p>',
            '</div>',
        ].join('');

        var element = file.getElementByXPath('/html/body/div');

        element.addChildren(htmlString);

        var div = _.last(element.children);
        var h1  = _.first(div.children);
        var p   = _.last(div.children);

        div.name.should.eql('div');
        h1.name.should.eql('h1');
        p.name.should.eql('p');
    });

    it('.addChildren(element, { before: referenceElement })', function (done) {

        var file = new DomFile(__dirname + '/html-files/index.html');

        var refElementPromise = file.getElementByXPath('/html/body/div/h2');
        var parElementPromise = file.getElementByXPath('/html/body/div');

        q.all([refElementPromise, parElementPromise])
            .then(function (elements) {

                var parent    = elements[1];
                var reference = elements[0];

                parent.addChildren('<div id="teste"></div>', {
                    before: reference,
                });

                var addedElIndex = _.findIndex(parent.children, function (el) {
                    if (el.type === 'tag') {
                        return el.attribs.id === 'teste';
                    }
                });

                addedElIndex.should.eql(parent._getChildIndex(reference) - 1);

                done();
            })
            .done();
    });

    it('.addChildren(elements, { after: referenceElement })', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var parent = file.getElementByXPath('/html/body/div');
        var reference = file.getElementByXPath('/html/body/div/h1');

        parent.addChildren('<a id="teste"></a>', {
            after: reference,
        });

        var addedElementIndex = _.findIndex(parent.children, function (el) {
            if (el.type === 'tag') {
                return el.attribs.id === 'teste';
            }
        });

        addedElementIndex.should.eql(parent._getChildIndex(reference) + 1);
    });

    it('.removeChildren(elements)', function () {
    });
});
