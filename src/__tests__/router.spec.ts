import { vi, describe, it, expect } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { withPipeline, getRouter } from '../index';
import MockComponent from '../../mocks/MockComponent.vue';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import type {
  Constructor,
  Destination,
  Middleware,
  Next,
} from '../index.d';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function factory() {
  const middlewareCallbackOne = vi.fn();
  const middlewareOne: Constructor<Middleware> = class {
    public async handle(to: RouteLocationNormalized, next: Next): Promise<Destination> {
      middlewareCallbackOne();

      return next(to);
    }
  };

  const middlewareCallbackTwo = vi.fn();
  const middlewareTwo: Constructor<Middleware> = class {
    public async handle(to: RouteLocationNormalized, next: Next): Promise<Destination> {
      middlewareCallbackTwo();

      return next(to);
    }
  };

  const middlewareCallbackThree = vi.fn();
  const middlewareThree: Constructor<Middleware> = class {
    public async handle(to: RouteLocationNormalized, next: Next): Promise<Destination> {
      middlewareCallbackThree();

      return next(to);
    }
  };

  const middlewareFourRedirector = class {
    public async handle(): Promise<Destination> {
      return getRouter().resolve({
        name: 'redirect-test-destination',
      });
    }
  };

  const middlewareCallbackFive = vi.fn();
  const middlewareFive: Constructor<Middleware> = class {
    public async handle(to: RouteLocationNormalized, next: Next): Promise<Destination> {
      middlewareCallbackFive();

      return next(to);
    }
  };

  const middlewareStack: Record<string, Constructor<Middleware>> = {
    auth: middlewareOne,
    guest: middlewareTwo,
    verified: middlewareThree,
  };

  const routes: Array<Readonly<RouteRecordRaw>> = [
    {
      path: '/test',
      name: 'test',
      meta: {
        middleware: {
          before: ['auth', middlewareTwo],
          after: ['verified'],
        },
      },
      component: MockComponent,
    },
    {
      path: '/redirect-test',
      name: 'redirect-test',
      meta: {
        middleware: {
          before: [middlewareFourRedirector, middlewareFive],
        },
      },
      component: MockComponent,
    },
    {
      path: '/redirect-test-destination',
      name: 'redirect-test-destination',
      component: MockComponent,
    },
  ];

  const router = withPipeline(createRouter({
    history: createWebHistory('/'),
    routes,
  }), middlewareStack);

  return {
    middlewareCallbackOne,
    middlewareOne,
    middlewareCallbackTwo,
    middlewareTwo,
    middlewareCallbackThree,
    middlewareThree,
    middlewareFourRedirector,
    middlewareCallbackFive,
    middlewareFive,
    middlewareStack,
    routes,
    router,
  };
}

describe('using the withPipeline function, the returned router', () => {
  it('runs the provided middleware as beforeEach and afterEach hooks', async () => {
    const {
      router,
      middlewareCallbackOne,
      middlewareCallbackTwo,
      middlewareCallbackThree,
    } = factory();

    await router.push('/test');

    expect(middlewareCallbackOne).toHaveBeenCalled();
    expect(middlewareCallbackTwo).toHaveBeenCalled();
    expect(middlewareCallbackThree).toHaveBeenCalled();
  });

  it('can redirect if the pipeline returns a different route than the original destination', async () => {
    const {
      router,
      middlewareCallbackFive,
    } = factory();

    await router.push('/test');
    await router.push('/redirect-test');
    expect(getRouter().currentRoute.value.name).toBe('redirect-test-destination');
    expect(middlewareCallbackFive).not.toHaveBeenCalled();
  });

  it('can block routing if the target destination is the same as the current route', async () => {
    const {
      router,
      middlewareCallbackOne,
      middlewareCallbackTwo,
      middlewareCallbackThree,
    } = factory();

    await router.push('/test');
    expect(middlewareCallbackOne).toHaveBeenCalledTimes(1);
    expect(middlewareCallbackTwo).toHaveBeenCalledTimes(1);
    expect(middlewareCallbackThree).toHaveBeenCalledTimes(1);
    await router.push('/test');
    expect(middlewareCallbackOne).toHaveBeenCalledTimes(1);
    expect(middlewareCallbackTwo).toHaveBeenCalledTimes(1);
    expect(middlewareCallbackThree).toHaveBeenCalledTimes(1);
  });
});
