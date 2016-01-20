'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseToFuture = promiseToFuture;
exports.pipeF = pipeF;
exports.execOrReturn = execOrReturn;
exports.createPipeline = createPipeline;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _ramdaFantasy = require('ramda-fantasy');

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

/*
 Performs left-to-right composition of one or more chainable functions.
 The leftmost function may have any arity; the remaining functions must be unary.
 :: List (a -> Functor) -> (a -> Functor)
*/
function pipeF() {
  for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
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
  var readers = pipelineConfig.with.map(execOrReturn);
  var readerPipeline = _ramda2.default.sequence(_ramdaFantasy.Reader.of, readers);

  return readerPipeline.map(function (executedReaders) {
    var res = pipelineConfig.yield.apply(pipelineConfig, _toConsumableArray(executedReaders));

    return _ramda2.default.is(Array, res) ? pipeF.apply(undefined, _toConsumableArray(res)) : res;
  });
}