import type { Constructor, AnyFunction, InferredAsyncFunction } from '../index.d';

export function isConstructor(value: unknown): value is Constructor {
  return (
    typeof value === 'function'
    && !!value.prototype
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    && !Object.getOwnPropertyDescriptor(value, 'prototype')!.writable
  );
}

export function isAnyFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function';
}

export function isAsyncFunction<V>(value: V): value is InferredAsyncFunction<V> {
  if (!isAnyFunction(value)) {
    return false;
  }

  return value.constructor.name === 'AsyncFunction';
}
