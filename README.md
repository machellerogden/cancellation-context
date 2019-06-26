# cancellation-context

> Promise-cancellation made easy. Cancel one or more promises in a given context.

# Install

`npm i cancellation-context`

# Usage

Create a new context by calling the exported factory function.

```js
const CancellationContext = require('cancellation-context');
const context = CancellationContext();
```

The returned context has the following methods.

## Methods

### `.cancellable(fn)`

### `.persishable(fn, ttl)`

### `.cancel(promise)`

### `.cancelAll()`

# Examples

### Simple Cancellation

```
const context = require('cancellation-context')();

(async () => {

    try {
        const ttl = 1000; // try increasing to 10000
        console.log(await context.perishable(cancelled => context.delay(1500, cancelled).then(() => 'success'), ttl));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
```

### Async Iterables

```
const context = require('cancellation-context')();

(async () => {

    async function* loop() {
        while (true) {
            const promises = [
                context.cancellable(cancelled => context.delay(500, cancelled).then(() => (console.log('done'),'success'))),
                context.cancellable(cancelled => context.delay(1000, cancelled).then(() => (console.log('done'),'success'))),
                context.cancellable(cancelled => context.delay(1500, cancelled).then(() => (console.log('done'),'success')))
            ];
            yield await Promise.all(promises);
        }
    }

    setTimeout(() => context.cancelAll(), 4000);

    try {
        for await (const result of loop()) {
            console.log(result);
        }
    } catch (e) {
        context.cancelAll();
        console.error('Boom!', e);
        process.exit(1);
    }

})();
```
