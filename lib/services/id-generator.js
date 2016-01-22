'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = IdGenerator;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function IdGenerator() {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var version = config.version || 'v1';

  return {
    next: function next() {
      return _uuid2.default[version]();
    }
  };
}
module.exports = exports['default'];