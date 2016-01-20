import R from 'ramda';
import { Future, Reader } from 'ramda-fantasy';

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
