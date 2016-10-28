/*can-list-sort@0.0.0#can-list-sort*/
define(function (require, exports, module) {
    var CanList = require('can-list');
    var bubble = require('can-map/bubble');
    var assign = require('can-util/js/assign');
    var each = require('can-util/js/each');
    var canEvent = require('can-event');
    var makeArray = require('can-util/js/make-array');
    var diff = require('can-util/js/diff');
    var oldBubbleRule = CanList._bubbleRule;
    CanList._bubbleRule = function (eventName, list) {
        var oldBubble = oldBubbleRule.apply(this, arguments);
        if (list.comparator && oldBubble.indexOf('change') === -1) {
            oldBubble.push('change');
        }
        return oldBubble;
    };
    var makeMoveFromPatch = function (list, patch) {
        if (patch.length === 2) {
            var deleted, inserted, deletedIndex, insertedIndex;
            if (patch[0].deleteCount === 1) {
                deleted = list[patch[0].index];
                deletedIndex = patch[0].index;
            } else if (patch[0].insert.length === 1) {
                inserted = patch[0].insert[0];
                insertedIndex = patch[0].index;
            }
            if (patch[1].deleteCount === 1) {
                deleted = list[patch[1].index];
                deletedIndex = patch[1].index;
            } else if (patch[1].insert.length === 1) {
                inserted = patch[1].insert[0];
                insertedIndex = patch[1].index;
            }
            if (deleted === inserted) {
                list._swapItems(deletedIndex, insertedIndex);
                return true;
            }
        }
    };
    var proto = CanList.prototype, _changes = proto._changes || function () {
        }, setup = proto.setup, unbind = proto.unbind;
    assign(proto, {
        setup: function () {
            setup.apply(this, arguments);
            this.bind('change', this._changes.bind(this));
            this._comparatorBound = false;
            this.bind('comparator', this._comparatorUpdated.bind(this));
            delete this._init;
            if (this.comparator) {
                this.sort();
            }
        },
        _comparatorUpdated: function (ev, newValue) {
            if (newValue || newValue === 0) {
                this.sort();
                if (this._bindings > 0 && !this._comparatorBound) {
                    this.bind('change', this._comparatorBound = function () {
                    });
                }
            } else if (this._comparatorBound) {
                unbind.call(this, 'change', this._comparatorBound);
                this._comparatorBound = false;
            }
        },
        unbind: function () {
            var res = unbind.apply(this, arguments);
            if (this._comparatorBound && this._bindings === 1) {
                unbind.call(this, 'change', this._comparatorBound);
                this._comparatorBound = false;
            }
            return res;
        },
        _comparator: function (a, b) {
            var comparator = this.comparator;
            if (comparator && typeof comparator === 'function') {
                return comparator(a, b);
            }
            if (typeof a === 'string' && typeof b === 'string' && ''.localeCompare) {
                return a.localeCompare(b);
            }
            return a === b ? 0 : a < b ? -1 : 1;
        },
        _changes: function (ev, attr) {
            var dotIndex = ('' + attr).indexOf('.');
            if (this.comparator && dotIndex !== -1) {
                if (ev.batchNum) {
                    if (ev.batchNum === this._lastProcessedBatchNum) {
                        return;
                    } else {
                        this.sort();
                        this._lastProcessedBatchNum = ev.batchNum;
                        return;
                    }
                }
                var currentIndex = +attr.substr(0, dotIndex);
                var item = this[currentIndex];
                var changedAttr = attr.substr(dotIndex + 1);
                if (typeof item !== 'undefined' && (typeof this.comparator !== 'string' || this.comparator.indexOf(changedAttr) === 0)) {
                    var newIndex = this._getRelativeInsertIndex(item, currentIndex);
                    if (newIndex !== currentIndex) {
                        this._swapItems(currentIndex, newIndex);
                        canEvent.dispatch.call(this, 'length', [this.length]);
                    }
                }
            }
            _changes.apply(this, arguments);
        },
        _getInsertIndex: function (item, lowerBound, upperBound) {
            var insertIndex = 0;
            var a = this._getComparatorValue(item);
            var b, dir, comparedItem, testIndex;
            lowerBound = typeof lowerBound === 'number' ? lowerBound : 0;
            upperBound = typeof upperBound === 'number' ? upperBound : this.length - 1;
            while (lowerBound <= upperBound) {
                testIndex = (lowerBound + upperBound) / 2 | 0;
                comparedItem = this[testIndex];
                b = this._getComparatorValue(comparedItem);
                dir = this._comparator(a, b);
                if (dir < 0) {
                    upperBound = testIndex - 1;
                } else if (dir >= 0) {
                    lowerBound = testIndex + 1;
                    insertIndex = lowerBound;
                }
            }
            return insertIndex;
        },
        _getRelativeInsertIndex: function (item, currentIndex) {
            var naiveInsertIndex = this._getInsertIndex(item);
            var nextItemIndex = currentIndex + 1;
            var a = this._getComparatorValue(item);
            var b;
            if (naiveInsertIndex >= currentIndex) {
                naiveInsertIndex -= 1;
            }
            if (currentIndex < naiveInsertIndex && nextItemIndex < this.length) {
                b = this._getComparatorValue(this[nextItemIndex]);
                if (this._comparator(a, b) === 0) {
                    return currentIndex;
                }
            }
            return naiveInsertIndex;
        },
        _getComparatorValue: function (item, singleUseComparator) {
            var comparator = singleUseComparator || this.comparator;
            if (item && comparator && typeof comparator === 'string') {
                item = typeof item[comparator] === 'function' ? item[comparator]() : item.attr(comparator);
            }
            return item;
        },
        _getComparatorValues: function () {
            var self = this;
            var a = [];
            this.each(function (item) {
                a.push(self._getComparatorValue(item));
            });
            return a;
        },
        sort: function (singleUseComparator) {
            var a, b, c, isSorted;
            var comparatorFn = typeof singleUseComparator === 'function' ? singleUseComparator : this._comparator, self = this;
            var now = makeArray(this), sorted = now.slice(0).sort(function (a, b) {
                    var aVal = self._getComparatorValue(a, singleUseComparator);
                    var bVal = self._getComparatorValue(b, singleUseComparator);
                    return comparatorFn.call(self, aVal, bVal);
                });
            var patch = diff(now, sorted);
            if (makeMoveFromPatch(this, patch)) {
                return;
            }
            for (var i, iMin, j = 0, n = this.length; j < n - 1; j++) {
                iMin = j;
                isSorted = true;
                c = undefined;
                for (i = j + 1; i < n; i++) {
                    a = this._getComparatorValue(this.attr(i), singleUseComparator);
                    b = this._getComparatorValue(this.attr(iMin), singleUseComparator);
                    if (comparatorFn.call(this, a, b) < 0) {
                        isSorted = false;
                        iMin = i;
                    }
                    if (c && comparatorFn.call(this, a, c) < 0) {
                        isSorted = false;
                    }
                    c = a;
                }
                if (isSorted) {
                    break;
                }
                if (iMin !== j) {
                    this._swapItems(iMin, j);
                }
            }
            canEvent.dispatch.call(this, 'length', [this.length]);
            return this;
        },
        _swapItems: function (oldIndex, newIndex) {
            var temporaryItemReference = this[oldIndex];
            [].splice.call(this, oldIndex, 1);
            [].splice.call(this, newIndex, 0, temporaryItemReference);
            canEvent.dispatch.call(this, 'move', [
                temporaryItemReference,
                newIndex,
                oldIndex
            ]);
        }
    });
    each({
        push: 'length',
        unshift: 0
    }, function (where, name) {
        var proto = CanList.prototype, old = proto[name];
        proto[name] = function () {
            if (this.comparator && arguments.length) {
                var args = makeArray(arguments);
                var length = args.length;
                var i = 0;
                var newIndex, val;
                while (i < length) {
                    val = bubble.set(this, i, this.__type(args[i], i));
                    newIndex = this._getInsertIndex(val);
                    Array.prototype.splice.apply(this, [
                        newIndex,
                        0,
                        val
                    ]);
                    this._triggerChange('' + newIndex, 'add', [val], undefined);
                    i++;
                }
                canEvent.dispatch.call(this, 'reset', [args]);
                return this;
            } else {
                return old.apply(this, arguments);
            }
        };
    });
    (function () {
        var proto = CanList.prototype;
        var oldSplice = proto.splice;
        proto.splice = function (index, howMany) {
            var args = makeArray(arguments);
            if (!this.comparator) {
                return oldSplice.apply(this, args);
            }
            oldSplice.call(this, index, howMany);
            args.splice(0, 2);
            proto.push.apply(this, args);
        };
    }());
});