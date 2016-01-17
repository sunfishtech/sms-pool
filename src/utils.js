import { Future } from 'ramda-fantasy';

export function promiseToFuture(f, ...args) {
  return Future((reject, resolve) =>
    f(...args).then(
      (response) => resolve(response),
      (err) => reject(err)
    )
  );
}
