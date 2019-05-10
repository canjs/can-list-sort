var CanList = require("can-list");
var CanMap = require("can-map");
var canCompute = require("can-compute");
var stache = require("can-stache");
var canBatch = require("can-event/batch/batch");
var each = require("can-util/js/each/each");
var QUnit = require("steal-qunit");
var CanModel = require("can-model");

require("can-list-sort");

QUnit.module('can-list-sort');

QUnit.test('List events', (4*3), function(assert) {
	var list = new CanList([{
		name: 'Justin'
	}, {
		name: 'Brian'
	}, {
		name: 'Austin'
	}, {
		name: 'Mihael'
	}]);
	list.attr('comparator','name');
	// events on a list
	// - move - item from one position to another
	//          due to changes in elements that change the sort order
	// - add (items added to a list)
	// - remove (items removed from a list)
	// - reset (all items removed from the list)
	// - change something happened
	// a move directly on this list
	list.bind('move', function (ev, item, newPos, oldPos) {
		assert.ok(ev, '"move" event passed `ev`');
		assert.equal(item.name, 'Zed', '"move" event passed correct `item`');
		assert.equal(newPos, 3, '"move" event passed correct `newPos`');
		assert.equal(oldPos, 0, '"move" event passed correct `oldPos`');
	});

	// a remove directly on this list
	list.bind('remove', function (ev, items, oldPos) {
		assert.ok(ev, '"remove" event passed ev');
		assert.equal(items.length, 1, '"remove" event passed correct # of `item`\'s');
		assert.equal(items[0].name, 'Alexis', '"remove" event passed correct `item`');
		assert.equal(oldPos, 0, '"remove" event passed correct `oldPos`');
	});

	list.bind('add', function (ev, items, index) {
		assert.ok(ev, '"add" event passed ev');
		assert.equal(items.length, 1, '"add" event passed correct # of items');
		assert.equal(items[0].name, 'Alexis', '"add" event passed correct `item`');
		assert.equal(index, 0, '"add" event passed correct `index`');
	});

	// Push: Should result in a "add" event
	list.push({
		name: 'Alexis'
	});

	// Splice: Should result in a "remove" event
	list.splice(0, 1);

	// Update: Should result in a "move" event
	list[0].attr('name', 'Zed');
});

QUnit.test('Passing a comparator function to sort()', 1, function(assert) {
	var list = new CanList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.sort(function (a, b) {
		// Sort functions always need to return the -1/0/1 integers
		if (a.priority < b.priority) {
			return -1;
		}
		return a.priority > b.priority ? 1 : 0;
	});
	assert.equal(list[0].name, 'high');
});

QUnit.test('Passing a comparator string to sort()', 1, function(assert) {
	var list = new CanList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.sort('priority');
	assert.equal(list[0].name, 'high');
});

QUnit.test('Defining a comparator property', 1, function(assert) {
	var list = new CanList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	list.attr('comparator','priority');
	assert.equal(list[0].name, 'high');
});

QUnit.test('Defining a comparator property that is a function of a CanMap', 4, function(assert) {
	var list = new CanMap.List([
		new CanMap({
			text: 'Bbb',
			func: canCompute(function () {
				return 'bbb';
			})
		}),
		new CanMap({
			text: 'abb',
			func: canCompute(function () {
				return 'abb';
			})
		}),
		new CanMap({
			text: 'Aaa',
			func: canCompute(function () {
				return 'aaa';
			})
		}),
		new CanMap({
			text: 'baa',
			func: canCompute(function () {
				return 'baa';
			})
		})
	]);
	list.attr('comparator','func');

	assert.equal(list.attr()[0].text, 'Aaa');
	assert.equal(list.attr()[1].text, 'abb');
	assert.equal(list.attr()[2].text, 'baa');
	assert.equal(list.attr()[3].text, 'Bbb');
});

QUnit.test('Sorts primitive items', function(assert) {
	var list = new CanList(['z', 'y', 'x']);
	list.sort();

	assert.equal(list[0], 'x', 'Moved string to correct index');
});



function renderedTests (templateEngine, helperType, renderer) {
	QUnit.test('Insert pushed item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function(assert) {
		var el = document.createElement('div');

		var items = new CanList([{
			id: 'b'
		}]);
		items.attr('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		/// Check that the template rendered an item
		assert.equal(firstElText, 'b',
			'First LI is a "b"');

		// Add another item
		items.push({
			id: 'a'
		});

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the template rendered that item at the correct index
		assert.equal(firstElText, 'a',
			'An item pushed into the list is rendered at the correct position');

	});

	// TODO: Test that push and sort have the result in the same output

	QUnit.test('Insert unshifted item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function(assert) {
		var el = document.createElement('div');

		var items = new CanList([
			{ id: 'a' },
			{ id: 'c' }
		]);
		items.attr('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		/// Check that the template rendered an item
		assert.equal(firstElText, 'a', 'First LI is a "a"');

		// Attempt to add an item to the beginning of the list
		items.unshift({
			id: 'b'
		});

		firstElText = el.querySelectorAll('li')[1].firstChild.data;

		// Check that the template rendered that item at the correct index
		assert.equal(firstElText, 'b',
			'An item unshifted into the list is rendered at the correct position');

	});

	QUnit.test('Insert spliced item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function(assert) {
		var el = document.createElement('div');

		var items = new CanList([
			{ id: 'b' },
			{ id: 'c' }
		]);
		items.attr('comparator','id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "b" is at the beginning of the list
		assert.equal(firstElText, 'b',
			'First LI is a b');

		// Add a "1" to the middle of the list
		items.splice(1, 0, {
			id: 'a'
		});

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the "a" was added to the beginning of the list despite
		// the splice
		assert.equal(firstElText, 'a',
			'An item spliced into the list at the wrong position is rendered ' +
			'at the correct position');

	});

	// TODO: Test adding and removing items at the same time with .splice()

	QUnit.test('Moves rendered item to correct index after "set" using ' + helperType +' helper', function(assert) {
		var el = document.createElement('div');

		var items = new CanList([
			{ id: 'x' },
			{ id: 'y' },
			{ id: 'z' }
		]);
		items.attr('comparator', 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "x" is at the beginning of the list
		assert.equal(firstElText, 'x', 'First LI is a "x"');

		// Change the ID of the last item so that it's sorted above the first item
		items.attr('2').attr('id', 'a');

		// Get the text of the first <li> in the <div>
		firstElText = el.querySelector('li').firstChild.data;

		// Check that the "a" was added to the beginning of the list despite
		// the splice
		assert.equal(firstElText, 'a', 'The last item was moved to the first position ' +
			'after it\'s value was changed');

	});

	QUnit.test('Move DOM items when list is sorted with  ' + templateEngine + ' using the ' + helperType +' helper', function(assert) {
		var el = document.createElement('div');

		var items = new CanList([
			{ id: 4 },
			{ id: 1 },
			{ id: 6 },
			{ id: 3 },
			{ id: 2 },
			{ id: 8 },
			{ id: 0 },
			{ id: 5 },
			{ id: 6 },
			{ id: 9 },
		]);

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		var firstElText = el.querySelector('li').firstChild.data;

		// Check that the "4" is at the beginning of the list
		assert.equal(firstElText, 4, 'First LI is a "4"');

		// Sort the list in-place
		items.attr('comparator' , 'id');

		firstElText = el.querySelector('li').firstChild.data;

		assert.equal(firstElText, 0, 'The `0` was moved to beginning of the list' +
			'once sorted.');

	});

	QUnit.test('Push multiple items with ' + templateEngine + ' using the ' + helperType +' helper (#1509)', function(assert) {
		var el = document.createElement('div');

		var items = new CanList();
		items.attr('comparator' , 'id');

		// Render the template and place inside the <div>
		el.appendChild(renderer({
			items: items
		}));

		items.bind('add', function (ev, items) {
			assert.equal(items.length, 1, 'One single item was added');
		});

		items.push.apply(items, [
			{ id: 4 },
			{ id: 1 },
			{ id: 6 }
		]);

		var liLength = el.getElementsByTagName('li').length;

		assert.equal(liLength, 3, 'The correct number of items have been rendered');

	});

}

var blockHelperTemplate = '<ul>{{#items}}<li>{{id}}</li>{{/items}}';
var eachHelperTemplate = '<ul>{{#each items}}<li>{{id}}</li>{{/each}}';


renderedTests('Stache', '{{#block}}', stache(blockHelperTemplate));
renderedTests('Stache', '{{#each}}', stache(eachHelperTemplate));


QUnit.test('Sort primitive values without a comparator defined', function(assert) {
	var list = new CanList([8,5,2,1,5,9,3,5]);
	list.sort();
	assert.equal(list[0], 1, 'Sorted the list in ascending order');
});

QUnit.test('Sort primitive values with a comparator function defined', function(assert) {
	var list = new CanList([8,5,2,1,5,9,3,5]);
	list.attr('comparator' , function (a, b) {
		return a === b ? 0 : a < b ? 1 : -1;
	});
	assert.equal(list[0], 9, 'Sorted the list in descending order');
});

QUnit.test('The "destroyed" event bubbles on a sorted list', 2, function(assert) {
	var done = assert.async();
	var list = new CanModel.List([
		new CanModel({ name: 'Joe' }),
		new CanModel({ name: 'Max' }),
		new CanModel({ name: 'Pim' })
	]);

	list.attr('comparator' , 'name');

	list.attr(0).destroy();

	list.bind('destroyed', function () {
		done();
		assert.ok(true, '"destroyed" event triggered');



		assert.equal(list.attr('length'), 2, 'item removed');
	});


});

QUnit.test("sorting works with #each (#1566)", function(assert) {

	var heroes = new CanList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);

	heroes.attr('comparator', 'name');

	var template = stache("<ul>\n{{#each heroes}}\n<li>{{id}}-{{name}}</li>\n{{/each}}</ul>");

	var frag = template({
		heroes: heroes
	});

	var lis = frag.childNodes[0].getElementsByTagName("li");

	assert.equal(lis[0].innerHTML, "2-Batman");
	assert.equal(lis[1].innerHTML, "1-Superman");

	heroes.attr('comparator', 'id');

	assert.equal(lis[0].innerHTML, "1-Superman");
	assert.equal(lis[1].innerHTML, "2-Batman");
});

QUnit.test("sorting works with comparator added after a binding", function(assert) {
	var heroes = new CanList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);

	var template = stache("<ul>\n{{#each heroes}}\n<li>{{id}}-{{name}}</li>\n{{/each}}</ul>");

	var frag = template({
		heroes: heroes
	});

	heroes.attr('comparator', 'id');

	heroes.attr("0.id",3);

	var lis = frag.childNodes[0].getElementsByTagName("li");

	assert.equal(lis[0].innerHTML, "2-Batman");
	assert.equal(lis[1].innerHTML, "3-Superman");

});

QUnit.test("removing comparator tears down bubbling", function(assert) {

	var heroes = new CanList([ { id: 1, name: 'Superman'}, { id: 2, name: 'Batman'} ]);
	var lengthHandler = function(){};

	heroes.bind("length",lengthHandler);

	assert.ok(!heroes[0].__bindEvents, "item has no bindings");

	heroes.attr('comparator', 'id');

	heroes.attr("0.id",3);

	assert.ok(heroes.__bindEvents._lifecycleBindings, "list has bindings");
	assert.ok(heroes[0].__bindEvents._lifecycleBindings, "item has bindings");

	heroes.removeAttr('comparator');

	assert.ok(!heroes[0].__bindEvents._lifecycleBindings, "item has no bindings");
	assert.ok(heroes.__bindEvents._lifecycleBindings, "list has bindings");

	heroes.unbind("length",lengthHandler);
	assert.ok(!heroes.__bindEvents._lifecycleBindings, "list has no bindings");
});

QUnit.test('sorting works when returning any negative value (#1601)', function(assert) {
	var list = new CanList([1, 4, 2]);

	list.attr('comparator', function(a, b) {
		return a - b;
	});

	list.sort();
	assert.deepEqual(list.attr(), [1, 2, 4]);
});

QUnit.test('Batched events originating from sort plugin lack batchNum (#1707)', function(assert) {
	var list = new CanList();
	list.attr('comparator', 'id');

	list.bind('length', function (ev) {
		assert.ok(ev.batchNum, 'Has batchNum');
	});

	canBatch.start();
	list.push({ id: 'a' });
	list.push({ id: 'a' });
	list.push({ id: 'a' });
	canBatch.stop();
});

QUnit.test('The sort plugin\'s _change handler ignores batched _changes (#1706)', function(assert) {
	var list = new CanList();
	var _getRelativeInsertIndex = list._getRelativeInsertIndex;
	var sort = list.sort;
	list.attr('comparator', 'id');

	list.bind('move', function () {
		assert.ok(false, 'No "move" events should be fired');
	});
	list._getRelativeInsertIndex = function () {
		assert.ok(false, 'No items should be evaluated independently');
		return _getRelativeInsertIndex.apply(this, arguments);
	};
	list.sort = function () {
		assert.ok(true, 'Batching caused sort() to be called');
		return sort.apply(this, arguments);
	};

	canBatch.start();
	list.push({ id: 'c', index: 1 });
	list.push({ id: 'a', index: 2 });
	list.push({ id: 'a', index: 3 });
	canBatch.stop();

	assert.equal(list.attr('2.id'), 'c', 'List was sorted');
});

QUnit.test('Items aren\'t unecessarily swapped to the end of a list of equal items (#1705)', function(assert) {
	var list = new CanList([
		{ id: 'a', index: 1 },
		{ id: 'b', index: 2 },
		{ id: 'c', index: 3 }
	]);
	list.attr('comparator', 'id');
	list.bind('move', function () {
		assert.ok(false, 'No "move" events should be fired');
	});

	list.attr('0.id', 'b');
	assert.equal(list.attr('0.index'), 1, 'Item hasn\'t moved');

	assert.ok(true, '_getRelativeInsertIndex prevented an unecessary \'move\' event');
});

QUnit.test('Items aren\'t unecessarily swapped to the beginning of a list of equal items (#1705)', function(assert) {
	var list = new CanList([
		{ id: 'a', index: 1 },
		{ id: 'b', index: 2 },
		{ id: 'c', index: 3 }
	]);
	list.attr('comparator', 'id');
	list.bind('move', function () {
		assert.ok(false, 'No "move" events should be fired');
	});

	list.attr('2.id', 'b');
	assert.equal(list.attr('2.index'), 3, 'Item hasn\'t moved');

	assert.ok(true, '_getRelativeInsertIndex prevented an unecessary \'move\' event');
});

QUnit.test('Insert index is not evaluted for irrelevant changes', function(assert) {
	var list = new CanList([
		{
			id: 'a',
			index: 1
		},
		{
			id: 'b',
			index: 2,
			child: {
				grandchild: {
					id: 'c',
					index: 3
				}
			}
		}
	]);

	// Setup
	var _getRelativeInsertIndex = list._getRelativeInsertIndex;

	list.bind('move', function () {
		assert.ok(false, 'A "move" events should be fired');
	});
	list._getRelativeInsertIndex = function () {
		assert.ok(false, 'This item should not be evaluated independently');
		return _getRelativeInsertIndex.apply(this, arguments);
	};
	list.attr('comparator', 'id');

	// Start test
	list.attr('0.index', 4);
	list.attr('comparator', 'child.grandchild.id');
	list.attr('1.child.grandchild.index', 4);

	list._getRelativeInsertIndex = function () {
		assert.ok(true, 'This item should be evaluated independently');
		return _getRelativeInsertIndex.apply(this, arguments);
	};

	list.attr('1.child', {
		grandchild: {
			id: 'c',
			index: 4
		}
	});

	assert.equal(list.attr('0.id'), 'a', 'Item not moved');
});

QUnit.test('_getInsertIndex positions items correctly', function(assert) {
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var alphabet = letters.split('');
	var expected = alphabet.slice(0);
	var sorted = new CanList(alphabet);

	// Enable the sort plugin
	sorted.attr('comparator', CanList.prototype._comparator);

	// There are some gotcha's that we can't compare to native sort:
	// http://blog.rodneyrehm.de/archives/14-Sorting-Were-Doing-It-Wrong.html
	var samples = ['0A','ZZ','**','LM','LL','Josh','James','Juan','Julia',
		'!!HOORAY!!'];

	each(samples, function (value) {
		expected.push(value);
		expected.sort(CanList.prototype._comparator);
		sorted.push(value);

		each(expected, function (value, index) {
			assert.equal(value, sorted.attr(index),
				'Sort plugin output matches native output');
		});
	});
});

QUnit.test('set comparator on init', function(assert) {
	var Item = CanMap.extend();
	Item.List = Item.List.extend({
		init: function() {
			this.attr('comparator', 'isPrimary');
		}
	});

	var items = [
		{ isPrimary: false },
		{ isPrimary: true },
		{ isPrimary: false }
	];

	assert.deepEqual(new Item.List(items).serialize(), [
		{ isPrimary: false },
		{ isPrimary: false },
		{ isPrimary: true }
	]);
});

QUnit.test('{{@index}} is updated for "move" events (#1962)', function(assert) {
	var list = new CanList([100, 200, 300]);
	list.attr('comparator', function (a, b) { return a < b ? -1 : 1; });

	var template = stache('<ul>{{#each list}}<li>' +
			'<span class="index">{{@index}}</span> - ' +
			'<span class="value">{{.}}</span>' +
		'</li>{{/each}}</ul>');

	var frag = template({ list: list });
	var expected;

	var evaluate = function () {
		var liEls = frag.querySelectorAll('li');

		for (var i = 0; i < expected.length; i++) {
			var li = liEls[i];
			var index = li.querySelectorAll('.index')[0].innerHTML;
			var value = li.querySelectorAll('.value')[0].innerHTML;

			assert.equal(index, ''+i, '{{@index}} rendered correct value');
			assert.equal(value, ''+expected[i], '{{.}} rendered correct value');
		}
	};

	expected = [100, 200, 300];
	evaluate();

	list.attr('comparator', function (a, b) { return a < b ? 1 : -1; });

	expected = [300, 200, 100];
	evaluate();
});

QUnit.test(".sort(comparatorFn) is passed list items regardless of .attr('comparator') value (#2159)", function(assert) {
	var list = new CanList([
		{ letter: 'x', number: 3 },
		{ letter: 'y', number: 2 },
		{ letter: 'z', number: 1 },
	]);

	list.attr('comparator', 'number');

	assert.equal(list.attr('0.number'), 1, 'First value is correct');
	assert.equal(list.attr('1.number'), 2, 'Second value is correct');
	assert.equal(list.attr('2.number'), 3, 'Third value is correct');

	list.sort(function (a, b) {
		a = a.attr('letter');
		b = b.attr('letter');
		return (a === b) ? 0 : (a < b) ? -1 : 1;
	});

	assert.equal(list.attr('0.letter'), 'x',
		'First value is correct after sort with single use comparator');
	assert.equal(list.attr('1.letter'), 'y',
		'Second value is correct after sort with single use comparator');
	assert.equal(list.attr('2.letter'), 'z',
		'Third value is correct after sort with single use comparator');
});

QUnit.test("List is not sorted on change after calling .sort(fn)", function(assert) {
	var list = new CanList([
		{ letter: 'x', number: 3 },
		{ letter: 'y', number: 2 },
		{ letter: 'z', number: 1 },
	]);

	list.sort(function (a, b) {
		a = a.attr('letter');
		b = b.attr('letter');
		return (a === b) ? 0 : (a < b) ? -1 : 1;
	});

	assert.equal(list.attr('0.letter'), 'x',
		'First value is correct after sort with single use comparator');
	assert.equal(list.attr('1.letter'), 'y',
		'Second value is correct after sort with single use comparator');
	assert.equal(list.attr('2.letter'), 'z',
		'Third value is correct after sort with single use comparator');

	list.sort = function () {
		assert.ok(false, 'The list is not sorted as a result of change');
	};

	list.attr('2.letter', 'a');

	assert.equal(list.attr('0.letter'), 'x','First value is still correct');
	assert.equal(list.attr('1.letter'), 'y', 'Second value is still correct');
	assert.equal(list.attr('2.letter'), 'a', 'Third value is correctly out of place');
});

QUnit.test('Sort returns a reference to the list', 2, function(assert) {
	var list = new CanList([{
		priority: 4,
		name: 'low'
	}, {
		priority: 1,
		name: 'high'
	}, {
		priority: 2,
		name: 'middle'
	}, {
		priority: 3,
		name: 'mid'
	}]);
	var sortFn = function (a, b) {
		// Sort functions always need to return the -1/0/1 integers
		if (a.priority < b.priority) {
			return -1;
		}
		return a.priority > b.priority ? 1 : 0;
	};

	var referenceOne = list.sort(sortFn);
	assert.equal(referenceOne, list, 'makeMoveFromPatch returns a reference to the list');
	var referenceTwo = list.sort(sortFn);
	assert.equal(referenceTwo, list, 'skipping makeMoveFromPatch returns a reference to the list');
});
