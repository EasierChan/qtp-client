/**
 * chenlei 2017/01/13
 */
"use strict";
var events_1 = require("events");
var net = require("net");
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
            _this.emit("connect", e);
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
//# sourceMappingURL=socket.js.map