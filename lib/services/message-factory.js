'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MessageFactory;

var _ramdaFantasy = require('ramda-fantasy');

var _ramda = require('ramda');

var _utils = require('../utils');

var appendId = function appendId(idField, idGen, data) {
  return (0, _ramda.assoc)(idField, idGen.next(), data);
};

var createMessage = function createMessage(messageType, idField, idGen, message) {
  var data = (0, _ramda.is)(String, idField) ? appendId(idField, idGen, message) : message;

  return (0, _utils.TryFuture)(function () {
    return messageType(data);
  });
};

function MessageFactory() {
  return (0, _ramdaFantasy.Reader)(function (env) {
    return {
      create: (0, _ramda.curry)(function (messageType, idField, message) {
        return createMessage(messageType, idField, env.idGenerator, message);
      })
    };
  });
}
module.exports = exports['default'];