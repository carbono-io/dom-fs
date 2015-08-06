var should = require('should'),
	_      = require('lodash'),
	q      = require('q');

var DomFile = require('../lib/dom-file');


describe('DomFile', function(){
	describe('.buildDom()', function() {
		it('build the dom', function() {


			var file = new DomFile(__dirname + '/html-files/index.html');

			var dom = file.dom;
			// is object
			dom.should.be.type('object')

			// is array
			dom.should.have.property('length');

		})
	})

	describe('.getElementByXPath()', function() {
		it('retrieves the element at given xPath', function() {


			var file = new DomFile(__dirname + '/html-files/index.html');

			var element = file.getElementByXPath('/html/head');
			
			element.should.be.type('object')
			element.type.should.eql('tag');
			element.name.should.eql('head');
		})
	})

	describe('.stringify(elementCallback)', function () {

		it('test', function () {

			var file = new DomFile(__dirname + '/html-files/index.html');

			function elementCallback(element) {

				if (element.type === 'tag') {
					element.attribs.xPath = element.getXPath();
				}
			}

			var dirtyHtml = file.stringify(elementCallback);

			// console.log(dirtyHtml);
			
			var cleanHtml = file.stringify();

			// console.log(cleanHtml)

		});
	});

	describe('.write(options)', function () {
		it('write to another file', function () {

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

			file.write(writeOptions);

		});
	})
})

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
			'</div>'
		].join('');

		var element = file.getElementByXPath('/html/body/div');


		element.addChildren(htmlString);

		var div = _.last(element.children),
			h1  = _.first(div.children),
			p   = _.last(div.children);

		div.name.should.eql('div');
		h1.name.should.eql('h1');
		p.name.should.eql('p');

	})

	it('.addChildren(element, { before: referenceElement })', function (testDone) {

		var file = new DomFile(__dirname + '/html-files/index.html');

		// get the reference element 
		var referenceElementPromise = file.getElementByXPath('/html/body/div/h2');

		// get the parent element
		var parentElementPromise = file.getElementByXPath('/html/body/div');


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

				// console.log(parent._getChildIndex(reference))

				// console.log(_.pluck(parent.children, 'type'));
				// console.log(_.pluck(parent.children, 'name'))

				addedElementIndex.should.eql(parent._getChildIndex(reference) - 1);

				testDone();
			})
			.done();


	});

	it('.addChildren(elements, { after: referenceElement })', function () {
		var file = new DomFile(__dirname + '/html-files/index.html');

		// get parent
		var parent = file.getElementByXPath('/html/body/div'),
		// reference
			reference = file.getElementByXPath('/html/body/div/h1');

		parent.addChildren('<a id="teste"></a>', {
			after: reference
		});

		var addedElementIndex = _.findIndex(parent.children, function (el) {

			if (el.type === 'tag') {
				return el.attribs.id === 'teste';
			}
		});

		addedElementIndex.should.eql(parent._getChildIndex(reference) + 1);
	});

	it('.removeChildren(elements)', function () {
		var file = new DomFile(__dirname + '/html-files/index.html');

		
	})
})