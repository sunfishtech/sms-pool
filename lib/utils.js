'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TryFuture = exports.Try = exports.upperCamelCase = exports.underscore = exports.Schema = exports.ensureValidObject = exports.validateObject = undefined;
exports.promiseToFuture = promiseToFuture;
exports.callbackToPromise = callbackToPromise;
exports.pipeF = pipeF;
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
 Converts a Promise returning function into a Future
 :: ((..args) -> Promise A Error) -> Future Error A
 */
function promiseToFuture(f) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return (0, _ramdaFantasy.Future)(function (reject, resolve) {
    return f.apply(undefined, args).then(function (response) {
      return resolve(response);
    }, function (err) {
      return reject(err);
    });
  });
}

function callbackToPromise(fn) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return new Promise(function (resolve, reject) {
    var handler = function handler(err, res) {
      return err ? reject(err) : resolve(res);
    };
    fn.apply(undefined, _toConsumableArray(args.concat([handler])));
  });
}

/*
 Performs left-to-right composition of one or more chainable functions.
 The leftmost function may have any arity; the remaining functions must be unary.
 :: List (a -> Functor) -> (a -> Functor)
*/
function pipeF() {
  for (var _len3 = arguments.length, fns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    fns[_key3] = arguments[_key3];
  }

  return function () {
    var chainer = function chainer(comp, fn) {
      return comp.chain(fn);
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

    return _ramda2.default.is(Array, res) ? pipeF.apply(undefined, _toConsumableArray(res)) : res;
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

var TryFuture = exports.TryFuture = function TryFuture(fn) {
  var maybe = Try(fn);

  return (0, _ramdaFantasy.Future)(function (reject, resolve) {
    return maybe.isRight ? resolve(maybe.value) : reject(maybe.value);
  });
};