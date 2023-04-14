import { isObject } from './helpers/object';
import Pipeline from './pipeline';
import { isConstructor } from './helpers/function';
import type {
  RouteLocationNormalized,
  RouteParamsRaw,
  Router as VueRouter,
  RouteRecordName,
} from 'vue-router';
import type { Middleware, RoutingContext, Constructor } from './index.d';

class Router {
  private static instance: VueRouter;
  private $isHashUpdate = false;

  public constructor(router: VueRouter, private readonly middleware: Record<string, Constructor<Middleware>>) {
    Router.instance = router;
  }

  public install(): VueRouter {
    Router.instance.beforeEach(this.startPipeline.bind(this));
    Router.instance.afterEach(this.finishPipeline.bind(this));

    return Router.instance;
  }

  public static getInstance(): VueRouter {
    if (!Router.instance) {
      throw new Error('Router not initialized.');
    }

    return Router.instance;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async startPipeline(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    this.reset();

    const context: RoutingContext = {
      from,
    };

    const destination = await new Pipeline()
      .send(to, context)
      .through(this.getPipes(to, from, 'before'))
      .thenReturn();

    if (destination === false) {
      return this.block();
    }

    if (destination === true) {
      return this.continue(to, context);
    }

    if (this.isRedirect(to, destination)) {
      return this.redirect(to, destination, context);
    }

    return this.continue(destination, context);
  }

  private async finishPipeline(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<void> {
    if (this.isSameRoute(to, from)) {
      return;
    }

    const context: RoutingContext = {
      from,
    };

    await new Pipeline()
      .send(to, context)
      .through(this.getPipes(to, from, 'after'))
      .thenReturn();
  }

  private getPipes(to: RouteLocationNormalized, from: RouteLocationNormalized, type: 'before' | 'after'): Middleware[] {
    if (this.isHashUpdate(to, from)) {
      return [];
    }

    // @ts-ignore
    return to.meta?.middleware?.[type]?.map($middleware => {
      if (isConstructor($middleware)) {
        return new $middleware();
      }

      if (isObject($middleware)) {
        return $middleware;
      }

      return new this.middleware[$middleware]();
    }) ?? [];
  }

  private redirect(original: RouteLocationNormalized, route: RouteLocationNormalized, context: RoutingContext): RouteLocationNormalized {
    const { from } = context;

    this.logRouting(`Visited '${original.fullPath}' from '${from.fullPath}', but was redirected to '${route.fullPath}'`);

    return route;
  }

  private block(): boolean {
    this.logRouting('Blocked routing');

    return false;
  }

  private continue(destination: RouteLocationNormalized, context: RoutingContext): boolean {
    const { from } = context;
    this.logRouting(`Visiting '${destination.fullPath}'${from?.fullPath ? ` from '${from.fullPath}'` : ''}`);

    return true;
  }

  private isRedirect(
    to: RouteLocationNormalized,
    destination: RouteLocationNormalized,
  ): boolean {
    return !!(destination.name && to.name?.toString() !== destination.name?.toString());
  }

  private isSameRoute(to: RouteLocationNormalized, from: RouteLocationNormalized): boolean {
    return to.fullPath === from.fullPath;
  }

  private logRouting(message: string): void {
    if (this.$isHashUpdate) {
      return;
    }

    console.log(`<Router> ${message}`);
  }

  private isHashUpdate(to: RouteLocationNormalized, from: RouteLocationNormalized): boolean {
    this.$isHashUpdate = to.path === from.path && to.hash !== from.hash;

    return this.$isHashUpdate;
  }

  public reset(): void {
    this.$isHashUpdate = false;
  }
}

export function withPipeline(router: VueRouter, middleware: Record<string, Constructor<Middleware>>): VueRouter {
  return new Router(router, middleware).install();
}

export function getRouter(): VueRouter {
  return Router.getInstance();
}

export function normalizeRoute(routeName: RouteRecordName, params?: RouteParamsRaw): RouteLocationNormalized {
  try {
    const route = getRouter().resolve({
      name: routeName,
      params,
    });

    if (!route) {
      throw new Error(`Route name "${routeName.toString()}" could not be resolved`);
    }

    return route;
  } catch (error) {
    const message = error instanceof Error ? ` Message: ${error.message}` : '';

    throw new Error(`Route name "${routeName.toString()}" could not be resolved.${message}`);
  }
}
