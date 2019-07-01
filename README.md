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

<a name="module_cancellation-context"></a>

## cancellation-context

* [cancellation-context](#module_cancellation-context)
    * [module.exports](#exp_module_cancellation-context--module.exports) ⇒ <code>CancellationContext</code> ⏏
        * [~CancellationContext](#module_cancellation-context--module.exports..CancellationContext)
            * [new CancellationContext()](#new_module_cancellation-context--module.exports..CancellationContext_new)
        * [~CancellationError](#module_cancellation-context--module.exports..CancellationError)
            * [new CancellationError()](#new_module_cancellation-context--module.exports..CancellationError_new)
        * [~TimeoutError](#module_cancellation-context--module.exports..TimeoutError)
            * [new TimeoutError()](#new_module_cancellation-context--module.exports..TimeoutError_new)
        * [~CancellationContextFactory()](#module_cancellation-context--module.exports..CancellationContextFactory) ⇒ <code>CancellationContext</code>
        * [~Cancellable(PromiseThunkFactory)](#module_cancellation-context--module.exports..Cancellable) ⇒ <code>CancellablePromise</code>
        * [~Perishable(PromiseThunkFactory)](#module_cancellation-context--module.exports..Perishable) ⇒ <code>PerishablePromise</code>
        * [~cancel(promise, reason)](#module_cancellation-context--module.exports..cancel) ⇒ <code>void</code>
        * [~cancelAll(reason)](#module_cancellation-context--module.exports..cancelAll) ⇒ <code>void</code>
        * [~delay(ms)](#module_cancellation-context--module.exports..delay) ⇒ <code>function</code>
        * [~timeout(ms)](#module_cancellation-context--module.exports..timeout) ⇒ <code>function</code>
        * [~CancellableDelay(ms)](#module_cancellation-context--module.exports..CancellableDelay) ⇒ <code>function</code>
        * [~CancellableTimeout(ms)](#module_cancellation-context--module.exports..CancellableTimeout) ⇒ <code>function</code>
        * [~PerishableTimeout(ms, ttl)](#module_cancellation-context--module.exports..PerishableTimeout) ⇒ <code>function</code>
        * [~PerishableDelay(ms, ttl)](#module_cancellation-context--module.exports..PerishableDelay) ⇒ <code>function</code>

<a name="exp_module_cancellation-context--module.exports"></a>

### module.exports ⇒ <code>CancellationContext</code> ⏏
Factory function for creating CancellationContext instances.

**Kind**: Exported member  
<a name="module_cancellation-context--module.exports..CancellationContext"></a>

#### module.exports~CancellationContext
**Kind**: inner class of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
**See**: CancellationContextFactory  
<a name="new_module_cancellation-context--module.exports..CancellationContext_new"></a>

##### new CancellationContext()
`CancellationContext` is a private class. Use exported `CancellationContextFactory` function for instantiation.

<a name="module_cancellation-context--module.exports..CancellationError"></a>

#### module.exports~CancellationError
**Kind**: inner class of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
**Implements**: <code>Error</code>  
<a name="new_module_cancellation-context--module.exports..CancellationError_new"></a>

##### new CancellationError()
An error class used for indicating cancellation events.

<a name="module_cancellation-context--module.exports..TimeoutError"></a>

#### module.exports~TimeoutError
**Kind**: inner class of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
**Implements**: <code>Error</code>  
<a name="new_module_cancellation-context--module.exports..TimeoutError_new"></a>

##### new TimeoutError()
An error class used for indicating timeout events.

<a name="module_cancellation-context--module.exports..CancellationContextFactory"></a>

#### module.exports~CancellationContextFactory() ⇒ <code>CancellationContext</code>
**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
<a name="module_cancellation-context--module.exports..Cancellable"></a>

#### module.exports~Cancellable(PromiseThunkFactory) ⇒ <code>CancellablePromise</code>
Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a CancellablePromise.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
**Returns**: <code>CancellablePromise</code> - A `CancellablePromise` is a promise with an additional `cancel` method attached.  

| Param | Type |
| --- | --- |
| PromiseThunkFactory | <code>function</code> | 

<a name="module_cancellation-context--module.exports..Perishable"></a>

#### module.exports~Perishable(PromiseThunkFactory) ⇒ <code>PerishablePromise</code>
Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a PerishablePromise.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
**Returns**: <code>PerishablePromise</code> - A `PerishablePromise` is a `CancellablePromise` which will be automatically cancelled after a specified amount of time.  

| Param | Type |
| --- | --- |
| PromiseThunkFactory | <code>function</code> | 

<a name="module_cancellation-context--module.exports..cancel"></a>

#### module.exports~cancel(promise, reason) ⇒ <code>void</code>
Given `promise` and `reason` calls canceller on `promise` with `reason`.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| promise | <code>Promise</code> | CancellablePromise to be cancelled |
| reason | <code>&#x27;string&#x27;</code> \| <code>&#x27;Error&#x27;</code> | reason for cancellation |

<a name="module_cancellation-context--module.exports..cancelAll"></a>

#### module.exports~cancelAll(reason) ⇒ <code>void</code>
Calls `cancel` method with `reason` on every CancellablePromise associated with the context instance.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>&#x27;string&#x27;</code> \| <code>&#x27;Error&#x27;</code> | reason for cancellation |

<a name="module_cancellation-context--module.exports..delay"></a>

#### module.exports~delay(ms) ⇒ <code>function</code>
A cancellable delay implementation which **resolves** after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
<a name="module_cancellation-context--module.exports..timeout"></a>

#### module.exports~timeout(ms) ⇒ <code>function</code>
A cancellable timeout implementation which **resolves** after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
<a name="module_cancellation-context--module.exports..CancellableDelay"></a>

#### module.exports~CancellableDelay(ms) ⇒ <code>function</code>
A CancellableFactory which **resolves** after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
<a name="module_cancellation-context--module.exports..CancellableTimeout"></a>

#### module.exports~CancellableTimeout(ms) ⇒ <code>function</code>
A CancellableFactory which **rejects** after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
<a name="module_cancellation-context--module.exports..PerishableTimeout"></a>

#### module.exports~PerishableTimeout(ms, ttl) ⇒ <code>function</code>
A PerishableFactory which **rejects** after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
<a name="module_cancellation-context--module.exports..PerishableDelay"></a>

#### module.exports~PerishableDelay(ms, ttl) ⇒ <code>function</code>
A PerishableFactory which resolves after given number of milliseconds.

**Kind**: inner method of [<code>module.exports</code>](#exp_module_cancellation-context--module.exports)  
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
