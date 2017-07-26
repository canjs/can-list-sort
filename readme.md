# can-list-sort

[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-list-sort.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/canjs/can-list-sort.png?branch=master)](https://travis-ci.org/canjs/can-list-sort)

`can-list-sort` is a plugin that makes it easy to define and maintain how items are arranged in a [can-list]. To use it, 
set a `comparator` [can-list::attr attr] on a [can-list]. It can be a `String` or `Function`.

## Overview

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

## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-list-sort';
```

### CommonJS use

Use `require` to load `can-list-sort` and everything else needed to create a template that uses `can-list-sort`:

```js
var plugin = require("can-list-sort");
```

### AMD use

Configure the `can` and `jquery` paths and the `can-list-sort` package:

```html
&lt;script src="require.js"&gt;&lt;/script&gt;
&lt;script&gt;
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-list-sort',
		    	location: 'node_modules/can-list-sort/dist/amd',
		    	main: 'lib/can-list-sort'
	    }]
	});
	require(["main-amd"], function(){});
&lt;/script&gt;
```

### Standalone use

Load the `global` version of the plugin:

```html
&lt;script src='./node_modules/can-list-sort/dist/global/can-list-sort.js'&gt;&lt;/script&gt;
```

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
