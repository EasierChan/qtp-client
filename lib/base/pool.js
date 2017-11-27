/**
 * chenlei 2017/01/13
 */
"use strict";
/**
 * a generic pool
 */
var Pool = (function () {
    function Pool(_pool) {
        if (_pool === void 0) { _pool = []; }
        this._pool = _pool;
    }
    /**
     * append new element into pool
     * @param ele new element
     */
    Pool.prototype.append = function (ele) {
        this._pool.push(ele);
        return this;
    };
    /**
     * prepend new element into pool
     * @param ele new element
     */
    Pool.prototype.prepend = function (ele) {
        this._pool.unshift(ele);
        return this;
    };
    /**
     * peek elements
     * @param
     */
    Pool.prototype.peek = function (n) {
        if (n === void 0) { n = 1; }
        return this._pool.slice(0, n);
    };
    /**
     * remove elements from _pool and return them.
     * @param n  the number of elements at the first of _pool to be removed.
     */
    Pool.prototype.remove = function (n) {
        if (n === void 0) { n = 1; }
        return this._pool.splice(0, n);
    };
    Pool.prototype.clear = function () {
        this._pool.length = 0;
    };
    Object.defineProperty(Pool.prototype, "length", {
        get: function () {
            return this._pool.length;
        },
        enumerable: true,
        configurable: true
    });
    return Pool;
}());
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map