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

Once you have a context, you can create new "cancellable-promise" instances within that context by calling `context.Cancellable` with promise-thunk factory.

> **Note:** Promises are eager by design and don't naturally lend themselve to cancellation. As such, arbitrary promises are not cancellable and the onus is the author to write cancellable promise implementations. No library, including this one, will be able to solve for that unless there are some fundamental changes to the JavaScript spec.

The `cancellation-context` library attempts to make the authoring of cancellable-promises as easy as possible by designing around the idea of promise-thunks.

The recommended pattern is as follows:

```
CancellableFactory = ({{ ...args }}) => onCancel => {{ promise }};
```

For example...

```
const context = require('cancellation-context')();

const MyCancellableFactory = msg => onCancel => new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(msg), 1000);
    onCancel(reason => {
        clearTimeout(t);
        resolve(reason);
    });
});

(async () => {
    const myCancellable = context.Cancellable(MyCancellableFactory('success!'));
    setTimeout(() => myCancellable.cancel('cancelled!'), 500);
    console.log(await myCancellable); // => 'cancelled!'
})();
```

By leveraging a thunk pattern, you can maintain composability while supporting the need for an `onCancel` hook.


## API

<a name="Cancellable"></a>

## Cancellable(PromiseThunkFactory) ⇒ <code>CancellablePromise</code>
Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a CancellablePromise.

**Kind**: global function  
**Returns**: <code>CancellablePromise</code> - A `CancellablePromise` is a promise with an additional `cancel` method attached.  

| Param | Type |
| --- | --- |
| PromiseThunkFactory | <code>function</code> | 

<a name="Perishable"></a>

## Perishable(PromiseThunkFactory) ⇒ <code>PerishablePromise</code>
Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a PerishablePromise.

**Kind**: global function  
**Returns**: <code>PerishablePromise</code> - A `PerishablePromise` is a `CancellablePromise` which will be automatically cancelled after a specified amount of time.  

| Param | Type |
| --- | --- |
| PromiseThunkFactory | <code>function</code> | 

<a name="cancel"></a>

## cancel(promise, reason) ⇒ <code>void</code>
Given `promise` and `reason` calls canceller on `promise` with `reason`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| promise | <code>Promise</code> | CancellablePromise to be cancelled |
| reason | <code>&#x27;string&#x27;</code> \| <code>&#x27;Error&#x27;</code> | reason for cancellation |

<a name="cancelAll"></a>

## cancelAll(reason) ⇒ <code>void</code>
Calls `cancel` method with `reason` on every CancellablePromise associated with the context instance.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>&#x27;string&#x27;</code> \| <code>&#x27;Error&#x27;</code> | reason for cancellation |

<a name="delay"></a>

## delay(ms) ⇒ <code>function</code>
A cancellable delay implementation which **resolves** after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |

**Example**  
```js
const cancellableDelay = context.Cancellable(context.delay(1500));
setTimeout(() => cancellableDelay.cancel(), 1000);
await cancellableDelay;
```
<a name="timeout"></a>

## timeout(ms) ⇒ <code>function</code>
A cancellable timeout implementation which **resolves** after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |

**Example**  
```js
const cancellableTimeout = context.Cancellable(context.delay(1500));
setTimeout(() => cancellableTimeout.cancel(), 1000);
await cancellableTimeout;
```
<a name="CancellableDelay"></a>

## CancellableDelay(ms) ⇒ <code>function</code>
A CancellableFactory which **resolves** after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |

**Example**  
```js
const cancellableDelay = context.CancellableDelay(1500));
setTimeout(() => cancellableDelay.cancel(), 1000);
await cancellableDelay;
```
<a name="CancellableTimeout"></a>

## CancellableTimeout(ms) ⇒ <code>function</code>
A CancellableFactory which **rejects** after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |

**Example**  
```js
const cancellableTimeout = context.CancellableTimeout(1500));
setTimeout(() => cancellableTimeout.cancel(), 1000);
await cancellableTimeout;
```
<a name="PerishableTimeout"></a>

## PerishableTimeout(ms, ttl) ⇒ <code>function</code>
A PerishableFactory which **rejects** after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |
| ttl | <code>number</code> | Number of milliseconds until cancelled |

**Example**  
```js
const cancellableTimeout = context.PerishableTimeout(1500, 1000);
await cancellableTimeout;
```
<a name="PerishableDelay"></a>

## PerishableDelay(ms, ttl) ⇒ <code>function</code>
A PerishableFactory which resolves after given number of milliseconds.

**Kind**: global function  
**Returns**: <code>function</code> - Returns function which accepts `onCancel` hook.  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | Number of milliseconds to wait |
| ttl | <code>number</code> | Number of milliseconds until cancelled |

**Example**  
```js
const cancellableDelay = context.PerishableDelay(1500, 1000);
await cancellableDelay;
```
# Examples

### Cancellable Delay

```js
const context = require('cancellation-context')();

(async () => {

    try {
        const ttl = 1000; // try increasing to 10000
        console.log(await context.PerishableTimeout(1500, ttl).then(() => 'success'));
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
        const promise = context.Cancellable(sleep(1500));
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
                context.CancellableTimeout(500).then(() => (console.log('done'), 'success')),
                context.CancellableTimeout(1000).then(() => (console.log('done'), 'success')),
                context.CancellableTimeout(1500).then(() => (console.log('done'), 'success'))
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
