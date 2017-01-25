@function can-list-sort/can-list.prototype.sort sort
@parent can-list-sort/can-list.prototype

@description Restore saved values of an Observe's properties.

@signature `list.sort( [newComparator] )`

Sorts the list using the provided `newComparator` string/function. This will not update the list's `comparator` property so the list will only be sorted once.

When a String comparator is used, the items wil be sorted in ascending order. To customize the sort behavior, provide your own `newComparator` function.

@param {String|Function} newComparator The string or function comparator used to sort the list.

@body

## One-time Sorting

Passing a `comparator` to the `sort` function will only sort the list once. The list will not be updated when changes 
to its items occur.

```js
var cart = new CanList([
	{ title: 'Juice', price: 3.05 }
	{ title: 'Butter', price: 3.50 },
	{ title: 'Bread', price: 4.00 }
]);
cart.sort("title");
console.log(cart); // -> [Bread, Butter, Juice]
cart.attr("0.title", "Milk");
console.log(cart); // -> [Milk, Butter, Juice]
```
