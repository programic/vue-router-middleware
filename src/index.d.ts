import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';

export type Destination = RouteLocationNormalized | boolean;

export type RoutingContext = {
  from: RouteLocationNormalized;
}

export type Next = (destination: RouteLocationNormalized) => Promise<Destination>;

export type MiddlewareHandler = (
  destination: RouteLocationNormalized, next: Next, context: RoutingContext,
) => Promise<Destination>;

export type Middleware = {
  handle: MiddlewareHandler;
}

export type RegisteredMiddleware = keyof typeof middleware;

export type Constructor<T = any> = new (...arguments_: any[]) => T;

export type Callable<T extends any[] = any[]> = (...arguments_: T) => void | Promise<void>;

export type AnyFunction = (...arguments_: any[]) => any;

export type InferredAsyncFunction<T> = T extends (...arguments_: infer A) => infer R
  ? R extends Promise<any>
    ? (...arguments_: A) => R
    : never
  : never;
