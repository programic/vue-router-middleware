import { describe, expect, it } from 'vitest';
import Pipeline from '../pipeline';

import type { RouteLocationNormalized } from 'vue-router';
import type { Middleware, RoutingContext } from '../index.d';

const mockTestPath = 'test-path';
const mockUpdatedTestPath = 'updated-test-path';
const mockPassable = {
  path: mockTestPath,
} as RouteLocationNormalized;
const mockUpdatedPassable = {
  path: mockUpdatedTestPath,
} as RouteLocationNormalized;
const mockContext = {} as RoutingContext;

function factory() {
  const callOrder: string[] = [];

  const mockMiddlewareOne: Middleware = {
    async handle(to, next) {
      callOrder.push('one');

      return next(to);
    },
  };

  const mockMiddlewareTwo: Middleware = {
    async handle(to, next) {
      callOrder.push('two');

      return next(to);
    },
  };

  const mockMiddlewareTwoWithoutNextCall: Middleware = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(_to, _next) {
      callOrder.push('two');

      return true;
    },
  };

  const mockMiddlewareThree: Middleware = {
    async handle(to, next) {
      callOrder.push('three');

      return next(to);
    },
  };

  const mockMiddlewareThreeWithChangedPassable: Middleware = {
    async handle(_to, next) {
      return next(mockUpdatedPassable);
    },
  };

  return {
    mockMiddlewareOne,
    mockMiddlewareTwo,
    mockMiddlewareTwoWithoutNextCall,
    mockMiddlewareThree,
    mockMiddlewareThreeWithChangedPassable,
    callOrder,
  };
}

describe('the pipeline class', () => {
  it('can call the middleware in the correct order', async () => {
    const {
      mockMiddlewareOne,
      mockMiddlewareTwo,
      mockMiddlewareThree,
      callOrder,
    } = factory();

    await new Pipeline()
      .send(mockPassable, mockContext)
      .through([mockMiddlewareOne, mockMiddlewareTwo, mockMiddlewareThree])
      .thenReturn();

    expect(callOrder[0]).toBe('one');
    expect(callOrder[1]).toBe('two');
    expect(callOrder[2]).toBe('three');
  });

  it('can break off the pipeline if the next function is not called', async () => {
    const {
      mockMiddlewareOne,
      mockMiddlewareTwoWithoutNextCall,
      callOrder,
    } = factory();

    await new Pipeline()
      .send(mockPassable, mockContext)
      .through([mockMiddlewareOne, mockMiddlewareTwoWithoutNextCall])
      .thenReturn();

    expect(callOrder[0]).toBe('one');
    expect(callOrder[1]).toBe('two');
    expect(callOrder[2]).toBe(undefined);
    expect(callOrder.length).toBe(2);
  });

  it('can change the value of the passable in its middleware', async () => {
    const {
      mockMiddlewareOne,
      mockMiddlewareTwo,
      mockMiddlewareThreeWithChangedPassable,
    } = factory();

    const destination = await new Pipeline()
      .send(mockPassable, mockContext)
      .through([mockMiddlewareOne, mockMiddlewareTwo, mockMiddlewareThreeWithChangedPassable])
      .thenReturn();

    if (typeof destination === 'boolean') {
      throw new TypeError('Destination is expected to be of type RouteLocationNormalized');
    }

    expect(destination.path).toBe(mockUpdatedTestPath);
  });
});
