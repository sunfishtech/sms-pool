import R from 'ramda';
import { Reader, Either } from 'ramda-fantasy';
import Joi from 'joi';
import S from 'string';
import { Typed } from 'typed-immutable';

export function pipeObs(...fns) {
  return function (...args) {
    const chainer = (comp, fn) => comp.flatMap(fn);
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

    return R.is(Array, res) ? pipeObs(...res) : res;
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

export const isRecordType = R.curry((recordTypeName, candidate = {}) => {
  const typeName = candidate[Typed.typeName];

  return R.is(Function, typeName) ? typeName.bind(candidate)() === recordTypeName : false;
});
