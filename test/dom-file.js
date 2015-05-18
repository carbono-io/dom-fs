var should = require('should'),
	_      = require('lodash'),
	q      = require('q');

var DomFile = require('../lib/dom-file');


describe('DomFile', function(){
	describe('.buildDom()', function() {
		it('build the dom', function(testDone) {


			var file = new DomFile(__dirname + '/html-files/index.html');

			file.buildDom()
				.then(function (dom) {

					// is object
					dom.should.be.type('object')

					// is array
					dom.should.have.property('length');

					testDone();

				}).fail(testDone);

		})
	})

	describe('.getElementAtXPath()', function() {
		it('retrieves the element at given xPath', function(testDone) {


			var file = new DomFile(__dirname + '/html-files/index.html');

			file.getElementAtXPath('/html/head')
				.then(function (element) {
					element.should.be.type('object')
					element.type.should.eql('tag');
					element.name.should.eql('head');

					testDone();

				}).fail(testDone);

		})
	})

	describe('.changeSource()', function() {
		it ('Changes the fab source collection name', function(testDone) {
			var file  = new DomFile(__dirname + '/html-files/index.html');

			file.changeSource('gallery_123456789', 'people')
				.then(function() {
					file.write().then(function() {
						testDone();
					});
				});
		})
	})

	describe('.stringify(elementCallback)', function () {

		it('test', function (testDone) {

			var file = new DomFile(__dirname + '/html-files/index.html');

			function elementCallback(element) {

				if (element.type === 'tag') {
					element.attribs.xPath = element.getXPath();
				}
			}

			file.stringify(elementCallback)
				.then(function (dirtyHtml) {

					// console.log(dirtyHtml);
				})
				.then(function () {

					return file.stringify();
				})
				.then(function (cleanHtml) {
					// console.log(cleanHtml);

					testDone();
				})
				.done();
		});
	});

	describe('.write(options)', function () {
		it('write to another file', function (testDone) {

			var file = new DomFile(__dirname + '/html-files/index.html');

			// options
			var writeOptions = {
				path: __dirname + '/html-files/index.marked.html',
				elementCallback: function (el) {
					if (el.type === 'tag') {

						if (el.getXPath() === '/html/body') {


							el.addChildren('<div id="lalala"></div>');
						}

						el.attribs['data-x-path'] = el.getXPath();
					}
				}
			};

			file.write(writeOptions).then(function () {
				testDone();
			})
			.done();

		});
	})
})

describe('DomElement', function () {
	it('.editAttribute', function (testDone) {
		var file = new DomFile(__dirname + '/html-files/index.html');

		file.getElementAtXPath('/html/body/h1')
			.then(function (element) {

				element.editAttribute('data-some-attribute', 'some value');

				return element;
			})
			// separate test from logic
			.then(function (element) {

				element.attribs['data-some-attribute'].should.eql('some value');

				testDone();
			})
			.done();
	});

	it('.addChildren(element)', function (testDone) {
		var file = new DomFile(__dirname + '/html-files/index.html');

		file.getElementAtXPath('/html/body/div')
			.then(function (element) {
				element.addChildren({
					type: 'tag',
					name: 'p',
				})

				return element;
			})
			.then(function (element) {

				_.last(element.children).name.should.eql('p');

				testDone();
			})
			.done();
	});

	it('.addChildren("<div><h1>ola</h1><p>falou</p></div>")', function (testDone) {
		var file = new DomFile(__dirname + '/html-files/index.html');


		var htmlString = [
			'<div>',
				'<h1>ola</h1>',
				'<p>falou</p>',
			'</div>'
		].join('');

		file.getElementAtXPath('/html/body/div')
			.then(function (element) {
				element.addChildren(htmlString);

				var div = _.last(element.children),
					h1  = _.first(div.children),
					p   = _.last(div.children);

				div.name.should.eql('div');
				h1.name.should.eql('h1');
				p.name.should.eql('p');

				testDone();
			})
			.done()
	})

	it('.addChildren(element, { before: referenceElement })', function (testDone) {

		var file = new DomFile(__dirname + '/html-files/index.html');

		// get the reference element 
		var referenceElementPromise = file.getElementAtXPath('/html/body/div/h2');

		// get the parent element
		var parentElementPromise = file.getElementAtXPath('/html/body/div');


		q.all([referenceElementPromise, parentElementPromise])
			.then(function (elements) {

				var parent    = elements[1],
					reference = elements[0];

				parent.addChildren('<div id="teste"></div>', {
					before: reference
				});

				var addedElementIndex = _.findIndex(parent.children, function (el) {

					if (el.type === 'tag') {
						return el.attribs.id === 'teste';
					}
				});

				// console.log(addedElementIndex);

				// console.log(parent.getChildIndex(reference))

				// console.log(_.pluck(parent.children, 'type'));
				// console.log(_.pluck(parent.children, 'name'))

				addedElementIndex.should.eql(parent.getChildIndex(reference) - 1);

				testDone();
			})
			.done();


	});

	it('.addChildren(element, { after: referenceElement })', function (testDone) {
		var file = new DomFile(__dirname + '/html-files/index.html');

		// get parent
		var parent = file.getElementAtXPath('/html/body/div'),
		// reference
			reference = file.getElementAtXPath('/html/body/div/h1');

		q.all([parent, reference])
			.then(function (elements) {

				var parent    = elements[0],
					reference = elements[1];

				parent.addChildren('<a id="teste"></a>', {
					after: reference
				});

				var addedElementIndex = _.findIndex(parent.children, function (el) {

					if (el.type === 'tag') {
						return el.attribs.id === 'teste';
					}
				});

				addedElementIndex.should.eql(parent.getChildIndex(reference) + 1);

				testDone();
			})
			.done()
	});
})