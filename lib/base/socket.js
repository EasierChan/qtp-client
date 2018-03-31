/**
 * chenlei 2017/01/13
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var net = require("net");
var tls = require("tls");
var localhost = "127.0.0.1";
var logger = console;
/**
 * TcpClient is
 */
var TcpSocket = (function () {
    /**
     * resolver: Resolver的实例
     */
    function TcpSocket() {
        this._emitter = new events_1.EventEmitter();
    }
    TcpSocket.prototype.on = function (event, listener) {
        return this._emitter.on(event, listener);
    };
    TcpSocket.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._emitter.emit(event, args);
    };
    /**
     * 连接
     */
    TcpSocket.prototype.connect = function (port, ip) {
        var _this = this;
        if (ip === void 0) { ip = localhost; }
        if (this._sock && this._sock !== null) {
            this._sock.end();
        }
        this._ip = ip;
        this._port = port;
        logger.info("start to connect to " + ip + ":" + port + "...");
        this._sock = null;
        this._sock = net.connect(port, ip, function (e) {
            logger.info(_this._sock.remoteAddress + ":" + _this._sock.remotePort + " connected.");
            _this.emit("connect", _this._sock.localAddress);
        });
        this._sock.setKeepAlive(true);
        this._sock.on("error", function (err) {
            logger.error(err.message);
            try {
                _this.emit("error", err);
            }
            catch (e) {
                console.info(e.message);
            }
        });
        this._sock.on("data", function (data) {
            _this.emit("data", data);
        });
        this._sock.on("end", function () {
            logger.info("Receive an FIN packet from " + (_this._sock.remoteAddress + ":" + _this._sock.remotePort));
            _this.emit("end");
        });
        this._sock.on("close", function (has_error) {
            console.warn(_this._ip + ":" + _this._port + " is closed " + (has_error ? "successfully" : "unexpected") + "!");
            _this.emit("close", has_error);
        });
    };
    /**
     * 发送数据
     */
    TcpSocket.prototype.send = function (data) {
        var _this = this;
        if (this._sock && this._sock.writable) {
            this._sock.write(data);
            return;
        }
        logger.error("connection is not writable.");
        this.connect(this._port, this._ip);
        this._sock.on("connect", function (e) {
            _this._sock.write(data);
        });
    };
    /**
     * 关闭连接
     */
    TcpSocket.prototype.close = function () {
        if (this._sock && this._sock.writable) {
            this._sock.end();
            return;
        }
    };
    return TcpSocket;
}());
exports.TcpSocket = TcpSocket;
var SSLSocket = (function (_super) {
    __extends(SSLSocket, _super);
    /**
     * resolver: Resolver的实例
     */
    function SSLSocket() {
        return _super.call(this) || this;
    }
    SSLSocket.prototype.on = function (event, listener) {
        return this._emitter.on(event, listener);
    };
    SSLSocket.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this._emitter.emit(event, args);
    };
    /**
     * 连接
     */
    SSLSocket.prototype.connect = function (port, ip) {
        var _this = this;
        if (ip === void 0) { ip = localhost; }
        if (this._sock && this._sock !== null) {
            this._sock.end();
        }
        this._ip = ip;
        this._port = port;
        logger.info("start to connect to " + ip + ":" + port + "...");
        this._sock = null;
        this._tlsSock = null;
        this._sock = net.connect(port, ip, function (e) {
            logger.info(_this._sock.remoteAddress + ":" + _this._sock.remotePort + " connected.");
            _this.emit("connect", _this._sock.localAddress);
        });
        this._sock.on("error", (err) => {
                _this.emit("error", err);
        });
        this._tlsSock = new tls.TLSSocket(this._sock);
        this._tlsSock.on("error", function (err) {
            logger.error(err.message);
            try {
                _this.emit("error", err);
            }
            catch (e) {
                console.info(e.message);
            }
        });
        this._tlsSock.on("data", function (data) {
            _this.emit("data", data);
        });
        this._tlsSock.on("end", function () {
            logger.info("Receive an FIN packet from " + (_this._ip + ":" + _this._port));
            _this.emit("end");
        });
        this._tlsSock.on("close", function (has_error) {
            console.warn("tslsock: " + _this._ip + ":" + _this._port + " is closed " + (has_error ? "unexpected" : "successfully") + "!");
            _this.emit("close", _this._ip + ":" + _this._port);
        });
    };
    /**
     * 发送数据
     */
    SSLSocket.prototype.send = function (data) {
        var _this = this;
        if (this._tlsSock && this._tlsSock.writable) {
            this._tlsSock.write(data);
            return;
        }
        logger.error("connection is not writable.");
        // this.connect(this._port, this._ip);
        // this._tlsSock.on("connect", function (e) {
        //     _this._tlsSock.write(data);
        // });
    };
    /**
     * 关闭连接
     */
    SSLSocket.prototype.close = function () {
        if (this._tlsSock && this._tlsSock.writable) {
            this._tlsSock.end();
            return;
        }
    };
    return SSLSocket;
}(TcpSocket));
exports.SSLSocket = SSLSocket;
//# sourceMappingURL=socket.js.map