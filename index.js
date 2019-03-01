let { QtpService } = require('./lib/qtp.service');
let { QtpMessageOption, QTPMessage, Header } = require('./lib/model/message.model');

exports.QtpService = QtpService;
exports.QtpMessageOption = QtpMessageOption;
exports.QTPMessage = QTPMessage;
exports.Header = Header;