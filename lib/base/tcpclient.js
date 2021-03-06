/**
 * chenlei 2017/01/16
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = require("./socket");
var pool_1 = require("./pool");
var events_1 = require("events");
/**
 * tcp client
 */
var TcpClient = (function () {
    /**
     * constructor
     * @param _clientSock
     * @param _bUseSelfBuffer use its own buffer queue or global.
     */
    function TcpClient(_bUseSelfBuffer) {
        if (_bUseSelfBuffer === void 0) { _bUseSelfBuffer = false; }
        this._bUseSelfBuffer = _bUseSelfBuffer;
        this._emitter = new events_1.EventEmitter();
    }
    TcpClient.prototype.on = function (event, listener) {
        return this._emitter.on(event, listener);
    };
    TcpClient.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._emitter.emit(event, args);
    };
    Object.defineProperty(TcpClient.prototype, "useSelfBuffer", {
        set: function (val) {
            this._bUseSelfBuffer = val;
        },
        enumerable: true,
        configurable: true
    });
    TcpClient.prototype.connect = function (port, ip, isSSL) {
        var _this = this;
        if (isSSL === void 0) { isSSL = true; }
        if (this._clientSock) {
            this._clientSock.close();
            this._buffer_Queue.clear();
        }
        this._clientSock = isSSL ? new socket_1.SSLSocket() : new socket_1.TcpSocket();
        this._clientSock.connect(port, ip);
        this._clientSock.on("data", function (data) {
            if (data instanceof Buffer) {
                _this.bufferQueue.append(data);
                // console.info(`income ${data.toString("hex")}`);
            }
            else if (data instanceof Array) {
                data.forEach(function (item) {
                    _this.bufferQueue.append(new Buffer(item.buffer));
                    // console.info(`income ${new Buffer(item.buffer).toString("hex")}`);
                });
            }
            _this.emit("buffer");
        });
        this._clientSock.on("connect", function (e) {
            _this.emit("connect", e);
        });
        this._clientSock.on("error", function (err) {
            _this.emit("error", err);
            // this._clientSock = null;
            _this._buffer_Queue.clear();
        });
        this._clientSock.on("end", function () {
            _this.emit("end");
            // this._clientSock = null;
            _this._buffer_Queue.clear();
        });
        this._clientSock.on("close", function (has_error) {
            if (_this._clientSock) {
                _this.emit("close", has_error);
                // _this._clientSock = null;
                _this._buffer_Queue.clear();
            }
        });
    };
    TcpClient.prototype.send = function (buf) {
        if (this._clientSock)
            return this._clientSock.send(buf);
        return false;
    };
    TcpClient.prototype.dispose = function () {
        if (this._clientSock){
            this._clientSock.close();
            this._buffer_Queue.clear();
        }
    };
    Object.defineProperty(TcpClient.prototype, "bufferQueue", {
        // static dispose(): void {
        //     TcpClient._s_bufferQueue = null;
        // }
        /**
         *
         */
        get: function () {
            if (this._buffer_Queue)
                return this._buffer_Queue;
            // if (this._bUseSelfBuffer)
            this._buffer_Queue = new pool_1.Pool();
            // else
            //     this._buffer_Queue = TcpClient._s_bufferQueue || (TcpClient._s_bufferQueue = new Pool<Buffer>());
            return this._buffer_Queue;
        },
        enumerable: true,
        configurable: true
    });
    return TcpClient;
}());
exports.TcpClient = TcpClient;
///# sourceMappingURL=tcpclient.js.map