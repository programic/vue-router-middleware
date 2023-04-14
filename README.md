# @programic/vue-route-middleware

Make complex global route middleware logic look easy and readable!

## Installation:

```bash
npm i @programic/vue-route-middleware

yarn add @programic/vue-route-middleware
```

## Basic Usage:

Set `middleware` meta key to your route and add our component to any vue router guard hook.

```js
import { withPipeline } from '@programic/vue-route-middleware';
import middlewares from '..';

...
const router = withPipeline(createRouter({
  ...
}), middlewares);

createApp(App).use(router);

```

**NOTICE:** Middleware function will retrieve all the variables normally passed to the router guards  
Example: (`to`, `from`, `next`) in case of `beforeEach` or (`to`, `from`) in case of `afterEach` guard.

#### router.js

```js
import AuthMiddleware from './route/middleware/auth';
...
meta: {
    middleware: [ AuthMiddleware ]
}
...
```

## Credits:
- [Programic](https://github.com/programic)
- [Rick Bongers](https://github.com/rbongers-programic)
