import R from 'ramda';
import { Future, Reader, Either } from 'ramda-fantasy';
import Joi from 'joi';
import S from 'string';

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
  const readers = pipelineConfig.with.map(execOrReturn)
    .concat(Reader.ask); // this will pass the environment as the last argument to yield
  const readerPipeline = R.sequence(Reader.of, readers);

  return readerPipeline.map((executedReaders) => {
    const res = pipelineConfig.yield(...executedReaders);

    return R.is(Array, res) ? pipeF(...res) : res;
  });
}

export function getOrThrow(either) {
  if (either.isRight) return either.value;
  throw either.value;
}

const validationToEither = R.ifElse(
  res => res.error,
  res => Either.Left(TypeError(res.error.details.map(x => x.message).join(', '))),
  res => Either.Right(res.value)
);

const validationOptions = {abortEarly: false};

export const validateObject = R.curry((schema, options, object) => {
  const opts = Object.assign(validationOptions, options);

  return validationToEither(Joi.validate(object, schema, opts));
});

export const ensureValidObject = R.curry((schema, options, object) =>
  getOrThrow(validateObject(schema, options, object))
);

export const Schema = (schemaDef) => Joi.object().keys(schemaDef);

export const underscore = (str) => S(str).underscore().toString();
export const upperCamelCase = (str) => S(str).capitalize().camelize().toString();

export const Try = (fn) => {
  try {
    return Either.Right(fn());
  } catch (err) {
    return Either.Left(err);
  }
};

export const TryFuture = (fn) => {
  const maybe = Try(fn);

  return Future((reject, resolve) =>
    maybe.isRight ? resolve(maybe.value) : reject(maybe.value)
  );
};
