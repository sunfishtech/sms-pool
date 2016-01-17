import { Typed } from 'typed-immutable';

export const Fn = Typed('Fn', value =>
  typeof (value) === 'function' ? value :
  TypeError(`"${value}" is not a function`));
