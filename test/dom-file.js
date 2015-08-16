var should = require('should');
var _      = require('lodash');
var q      = require('q');

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

	describe.skip('.removeElementAtXPath()', function() {
		it ('Removes an element together with its children from the DOM', function(testDone) {
			var file = new DomFile(__dirname + '/html-files/index.html');

			file.removeElementAtXPath('/html/body/div[2]/a')
				.then(function() {
					file.write().then(function() {
						testDone();
					})
				})
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
