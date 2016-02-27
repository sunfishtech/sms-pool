'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRecordType = exports.Try = exports.upperCamelCase = exports.underscore = exports.Schema = exports.ensureValidObject = exports.validateObject = undefined;
exports.pipeObs = pipeObs;
exports.execOrReturn = execOrReturn;
exports.createPipeline = createPipeline;
exports.getOrThrow = getOrThrow;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _ramdaFantasy = require('ramda-fantasy');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _string = require('string');

var _string2 = _interopRequireDefault(_string);

var _typedImmutable = require('typed-immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function pipeObs() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function () {
    var chainer = function chainer(comp, fn) {
      return comp.flatMap(fn);
    };
    var initFn = _ramda2.default.head(fns).apply(undefined, arguments);

    return _ramda2.default.reduce(chainer, initFn, _ramda2.default.tail(fns));
  };
}

/* :: Function | Value -> Function() | Value */
function execOrReturn(funcOrVal) {
  return _ramda2.default.is(Function, funcOrVal) ? funcOrVal() : funcOrVal;
}

/*
  Constructs a Reader by sequencing a list of supplied readers and
  composing the associated set of Future returning functions.

  :: Map String Reader -> Reader Env (...args -> Future)
*/
function createPipeline(pipelineConfig) {
  var readers = pipelineConfig.with.map(execOrReturn).concat(_ramdaFantasy.Reader.ask); // this will pass the environment as the last argument to yield
  var readerPipeline = _ramda2.default.sequence(_ramdaFantasy.Reader.of, readers);

  return readerPipeline.map(function (executedReaders) {
    var res = pipelineConfig.yield.apply(pipelineConfig, _toConsumableArray(executedReaders));

    return _ramda2.default.is(Array, res) ? pipeObs.apply(undefined, _toConsumableArray(res)) : res;
  });
}

function getOrThrow(either) {
  if (either.isRight) return either.value;
  throw either.value;
}

var validationToEither = _ramda2.default.ifElse(function (res) {
  return res.error;
}, function (res) {
  return _ramdaFantasy.Either.Left(TypeError(res.error.details.map(function (x) {
    return x.message;
  }).join(', ')));
}, function (res) {
  return _ramdaFantasy.Either.Right(res.value);
});

var validationOptions = { abortEarly: false };

var validateObject = exports.validateObject = _ramda2.default.curry(function (schema, options, object) {
  var opts = Object.assign(validationOptions, options);

  return validationToEither(_joi2.default.validate(object, schema, opts));
});

var ensureValidObject = exports.ensureValidObject = _ramda2.default.curry(function (schema, options, object) {
  return getOrThrow(validateObject(schema, options, object));
});

var Schema = exports.Schema = function Schema(schemaDef) {
  return _joi2.default.object().keys(schemaDef);
};

var underscore = exports.underscore = function underscore(str) {
  return (0, _string2.default)(str).underscore().toString();
};
var upperCamelCase = exports.upperCamelCase = function upperCamelCase(str) {
  return (0, _string2.default)(str).capitalize().camelize().toString();
};

var Try = exports.Try = function Try(fn) {
  try {
    return _ramdaFantasy.Either.Right(fn());
  } catch (err) {
    return _ramdaFantasy.Either.Left(err);
  }
};

var isRecordType = exports.isRecordType = _ramda2.default.curry(function (recordTypeName) {
  var candidate = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var typeName = candidate[_typedImmutable.Typed.typeName];

  return _ramda2.default.is(Function, typeName) ? typeName.bind(candidate)() === recordTypeName : false;
});