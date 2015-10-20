'use strict';
var should = require('chai').should();
var _      = require('lodash');
var q      = require('q');

var walkDom = require('../lib/dom-file/auxiliary.js').walkDom;

var DomFile = require('../lib/dom-file');

describe('DomElement', function () {
    it('.editAttribute', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var notified = false;

        var element = file.getElementByXPath('/html/body/h1');

        file.on('update', function (data) {
            data.element.uuid.should.eql(element.uuid);
            notified = true;
        });

        element.editAttribute('data-some-attribute', 'some value');
        element.attribs['data-some-attribute'].should.eql('some value');
        notified.should.be.true;
    });

    it('.addChild("<div><h1>ola</h1><p>falou</p></div>")', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var notified = false;

        var htmlString = [
            '<div>',
                '<h1>ola</h1>',
                '<p>falou</p>',
            '</div>',
        ].join('');

        var element = file.getElementByXPath('/html/body/div');

        file.on('update', function (data) {
            data.element.uuid.should.eql(element.uuid);
            notified = true;
        });

        element.addChild(htmlString);

        var div = _.last(element.children);
        var h1  = _.first(div.children);
        var p   = _.last(div.children);

        div.name.should.eql('div');
        h1.name.should.eql('h1');
        p.name.should.eql('p');
        notified.should.be.true;
    });

    it('.addChild(element, { before: referenceElement })', function (done) {

        var file = new DomFile(__dirname + '/html-files/index.html');

        var notified = false;

        var refElementPromise = file.getElementByXPath('/html/body/div/h2');
        var parElementPromise = file.getElementByXPath('/html/body/div');

        q.all([refElementPromise, parElementPromise])
            .then(function (elements) {

                var parent  = elements[1];
                var reference = elements[0];

                file.on('update', function (data) {
                    data.element.uuid.should.eql(parent.uuid);
                    notified = true;
                });

                parent.addChild('<div id="teste"></div>', {
                    before: reference,
                });

                var addedElIndex = _.findIndex(parent.children, function (el) {

                    if (el.type === 'tag') {
                        return el.attribs.id === 'teste';
                    }
                });

                addedElIndex.should.eql(parent._getChildIndex(reference) - 1);
                notified.should.be.true;

                done();
            })
            .done();
    });

    it('.addChild(elements, { after: referenceElement })', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var notified = false;

        var parent = file.getElementByXPath('/html/body/div');
        var reference = file.getElementByXPath('/html/body/div/h1');

        file.on('update', function (data) {
            data.element.uuid.should.eql(parent.uuid);
            notified = true;
        });

        parent.addChild('<a id="teste"></a>', {
            after: reference,
        });

        var addedElementIndex = _.findIndex(parent.children, function (el) {

            if (el.type === 'tag') {
                return el.attribs.id === 'teste';
            }
        });

        addedElementIndex.should.eql(parent._getChildIndex(reference) + 1);
        notified.should.be.true;
    });

    it('.addChild(<object>) should throw TypeError', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/div');

        var insert = {type: 'tag', name: 'div'};

        element.addChild.bind(element, insert).should.throw(TypeError);
    });

    it('.removeChild(element)', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var notified = false;
        file.on('update', function (data) {
            data.element.uuid.should.eql(parent.uuid);
            notified = true;
        });

        var parent = file.getElementByXPath('/html/body');
        var element = file.getElementByXPath('/html/body/h1');

        var oldLength = parent.children.length;

        parent.removeChild(element);

        var removed = file.getElementByXPath('/html/body/h1');
        should.not.exist(removed);
        parent.children.length.should.eql(oldLength - 1);
        notified.should.eql(true);
    });

    it('.removeChild(!<object>) should throw TypeError', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/div');

        element.removeChild.bind('error').should.throw(TypeError);
    });

    it('.removeChild() -> Error if element is not a child', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/div');
        var notChild = file.getElementByXPath('/html/body/h1');

        element.removeChild.bind(notChild).should.throw(Error);
    });

    it('.removeSelf()', function () {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var element = file.getElementByXPath('/html/body/h1');
        var parent = element.parent;

        element.removeSelf();

        parent.children.should.not.contain(element);
    });

    it('All tag elements should have UUIDs', function (done) {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var re = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

        walkDom(file.dom, function (el) {
            if (el.type === 'tag') {
                el.uuid.should.match(re);
            }
        });

        done();
    });

    it('Elements should be able to stringify their subtrees.', function (done) {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var html = file.getElementByXPath('/html');

        html.stringify().should.eql(file.stringify());

        done();
    });

    it('Element\'s stringify method should accept callback.', function (done) {
        var file = new DomFile(__dirname + '/html-files/index.html');

        var html = file.getElementByXPath('/html');

        html.stringify(function (el) {
            if (el.type === 'tag') {
                el.attribs.uuid = el.uuid;
            }
        });

        done();
    });
});
