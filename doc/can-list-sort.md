@module {can-list} can-list-sort
@parent can-legacy
@group can-list-sort/can-list.prototype 0 can-list.prototype
@test src/test/test.html
@package ../package.json

@signature `require('can-list-sort')`

Adds a [can-list-sort/can-list.prototype.sort] method to [can-list].

@return {can-list} Exports [can-list].

@body

`can-list-sort` is a plugin that makes it easy to define and maintain how items are arranged in a [can-list]. To use it, 
set a `comparator` [can-list::attr attr] on a [can-list]. It can be a `String` or `Function`.

## Use

Setting a comparator will sort the list immediately and, if your list is being listened to, will automatically sort when 
any of its items are changed:

```js
var CanList = require("can-list");
require('can-list-sort');

var cart = new CanList([
	{ title: 'Juice', price: 3.05 }
	{ title: 'Butter', price: 3.50 },
	{ title: 'Bread', price: 4.00 }
]);
cart.attr("comparator", 'price');
cart.bind("length", function(){});
cart.attr("0.price", 5);
cart; // -> [Butter, Bread, Juice]
```

And it will be kept in sorted order when items are pushed, unshifted, or spliced into the [can-list]:

```js
var cart = new CanList([
	{ title: 'Juice', price: 3.05 }
	{ title: 'Butter', price: 3.50 },
	{ title: 'Bread', price: 4.00 }
]);
cart.attr('comparator', 'price');
cart.bind("length", function(){});
cart.push({ title: 'Apple', price: 3.25 });
cart; // -> [Juice, Apple, Butter, Bread]
```

If you are using a [can-list] in a template, it will be bound to automatically.  Check out this demo that lets you 
change the sort order and a person's name:

@demo demos/can-list-sort/simple-sort.html

## String Comparators

String comparators will be passed to [can-list::attr] to retrieve the values being compared.

```js
var table = new CanList([
	[6, 3, 4],
	[1, 8, 2],
	[7, 9, 5]
]);
table.attr('comparator', '2') // Translates to: row.attr('2')
table  // -> [1, 8, 2],
       //    [6, 3, 4],
       //    [7, 9, 5]
```

The default sort order for string comparators is ascending. To sort items in descending order use a function comparator.

## Function Comparators

When a `String` is defined the default comparator function
arranges the items in ascending order. To customize the sort behavior,
define your own comparator function.

```js
var stockPrices = new CanList([
	0.01, 0.98, 0.75, 0.12, 0.05, 0.16
]);
stockPrices.attr("comparator", function (a, b) {
	return a === b ? 0 : a < b ? 1 : -1; // Descending
})
stockPrices // -> [0.98, 0.75, 0.16, 0.12, 0.05, 0.01];
```

## Move Events

Whenever there are changes to items in the [can-list], the sort plugin moves the item to the correct index and fires a 
"move" event.

```js
var cart = new CanList([
	{ title: 'Bread', price: 3.00 },
	{ title: 'Butter', price: 3.50 },
	{ title: 'Juice', price: 3.25 }
]);
cart.attr('comparator', 'price');

cart.bind('move', function (ev, item, newIndex, oldIndex) {
	console.log('Moved:', item.title + ', from:', oldIndex + ', to:', newIndex);
})

cart.attr('0.price', 4.00); // Moved: Bread, from: 0, to: 3
							// -> [Juice, Butter, Bread]
```

## Changing Comparators

A comparator can be set explicitly with [can-list::attr attr]. For soting a list once (with no automatic sorting), pass 
a comparator string or function to [can-list-sort/can-list.prototype.sort].
