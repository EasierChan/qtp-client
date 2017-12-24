/**
 * chenlei 2017/01/13
 */
"use strict";
var events_1 = require("events");
var Parser = (function () {
    /**
     * constructor
     */
    function Parser(_oPool) {
        this._oPool = _oPool;
        this._emitter = new events_1.EventEmitter();
    }
    Parser.prototype.on = function (event, listener) {
        return this._emitter.on(event, listener);
    };
    Parser.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._emitter.emit(event, args);
    };
    /**
     * destructor
     */
    Parser.prototype.dispose = function () {
        this._oPool.remove(this._oPool.length);
    };
    Parser.prototype.registerMsgFunction = function (type, self, func) {
        this.on(type.toString(), function (args) {
            func.call(self, args);
        });
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map