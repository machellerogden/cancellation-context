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

### `.delay(ms)`

# Examples

### Cancellable Delay

```js
const context = require('cancellation-context')();

(async () => {

    try {
        const ttl = 1000; // try increasing to 10000
        console.log(await context.perishable(context.delay(1500), ttl).then(() => 'success'));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
```

### Manual Cancellation

```js
const context = require('cancellation-context')();

function sleep(ms, cancelled) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve('success'), ms);
        cancelled.then(error => {
            clearTimeout(t);
            reject(error);
        });
    });
}

(async () => {

    try {
        const promise = context.cancellable(cancelled => sleep(1500, cancelled));
        const handle = setTimeout(() => context.cancel(promise), 1000); // try increasing to 10000
        console.log('Success!', await promise);
        clearTimeout(handle);
    } catch (e) {
        console.error('Boom!', e);
    }

})();
```

### Async Iterables

```js
const context = require('cancellation-context')();

(async () => {

    async function* loop() {
        while (true) {
            const promises = [
                context.cancellable(context.delay(500)).then(() => (console.log('done'),'success')),
                context.cancellable(context.delay(1000)).then(() => (console.log('done'),'success')),
                context.cancellable(context.delay(1500)).then(() => (console.log('done'),'success'))
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
