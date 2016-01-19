import R from 'ramda';
import { Future, Reader } from 'ramda-fantasy';
import { Map } from 'immutable';

/*
 Converts a Promise returning function into a Future
 :: ((..args) -> Promise A Error) -> Future Error A
 */
export function promiseToFuture(f, ...args) {
  return Future((reject, resolve) =>
    f(...args).then(
      (response) => resolve(response),
      (err) => reject(err)
    )
  );
}

export function MemoryCache() {
  let _cache = Map();
  const _mutate = (op, ...args) => { _cache = _cache[op](...args); return true; };

  return {
    get: (key, fn) => _cache.has(key) ?
      _cache.get(key) :
      _mutate('set', key, fn()) && _cache.get(key),
    set: (key, val) => _mutate('set', key, val),
    remove: (key) => _mutate('remove', key),
    clear: (key) => _mutate('clear')
  };
}

/*
 Performs left-to-right composition of one or more chainable functions.
 The leftmost function may have any arity; the remaining functions must be unary.
 :: List (a -> Functor) -> (a -> Functor)
*/
export function pipeF(...fns) {
  return function (...args) {
    const chainer = (comp, fn) => comp.chain(fn);
    const initFn = R.head(fns)(...args);

    return R.reduce(chainer, initFn, R.tail(fns));
  };
}

/* :: Function | Value -> Function() | Value */
export function execOrReturn(funcOrVal) {
  return R.is(Function, funcOrVal) ? funcOrVal() : funcOrVal;
}

/*
  Constructs a Reader by sequencing a list of supplied readers and
  composing the associated set of Future returning functions.

  :: Map String Reader -> Reader Env (...args -> Future)
*/
export function createPipeline(pipelineConfig) {
  const readers = pipelineConfig.with.map(execOrReturn);
  const readerPipeline = R.sequence(Reader.of, readers);

  return readerPipeline.map((executedReaders) => {
    const res = pipelineConfig.yield(...executedReaders);

    return R.is(Array, res) ? pipeF(...res) : res;
  });
}
