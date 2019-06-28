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

### `.timeout(ms)`

### `.delay(ms)`


## Authoring Cancellable Functions

Promises are eager by design and don't naturally lend themselve to cancellation. As such, arbitrary promises are not cancellable and the onus is the author to write cancellable promise implementations. No library, including this one, will be able to solve for that unless there are some fundamental changes to the JavaScript spec. That said, this library attemps to make it as easy as possible to author cancellable promises by support the idea of a cancellable-promise factory.

The recommended pattern is as follows:

```
const MyCancellableFactory = (<< args >>) => onCancel => new Promise(<< implementation >>);
```

For example...

```
const CancellationContext = require('cancellation-context');
const context = CancellationContext();

const MyCancellableFactory = msg => onCancel => new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(msg), 1000);
    onCancel(reason => {
        clearTimeout(t);
        resolve(reason);
    });
});

(async () => {
    const myCancellable = context.cancellable(MyCancellableFactory('success!'));
    setTimeout(() => myCancellable.cancel('cancelled!'), 500);
    console.log(await myCancellable); // => 'cancelled!'
})();
```

In this way, you can maintain composability while still receiving the `onCancel` hook.

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

const sleep = ms => onCancel => {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve('success'), ms);
        onCancel(error => {
            clearTimeout(t);
            reject(error);
        });
    });
};

(async () => {

    try {
        const promise = context.cancellable(sleep(1500));
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
    }

})();
```
