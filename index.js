'use strict';

const ExpirationMessage = ms => `${ms}ms TTL surpassed`;

class CancellationError extends Error {
    constructor(message, cause, ...args) {
        super(message, cause, ...args);
        Error.captureStackTrace(this, CancellationError);
        this.name = 'CancellationError';
        this.code = 'CANCELLED';
        if (cause) this.cause = cause;
    }
}

class TimeoutError extends Error {
    constructor(message, cause, ...args) {
        super(message, cause, ...args);
        Error.captureStackTrace(this, TimeoutError);
        this.name = 'TimeoutError';
        this.code = 'EXPIRED';
        if (cause) this.cause = cause;
    }
}

class CancellationContext {

    constructor() {
        this.cancellers = new Map();
    }

    /**
     * Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a CancellablePromise.
     *
     * @function Cancellable
     * @param {function} PromiseThunkFactory
     * @returns {CancellablePromise} A `CancellablePromise` is a promise with an additional `cancel` method attached.
     */
    Cancellable(fn) {
        const [ cancel, onCancel ] = this.createHooks();
        const promise = Promise.resolve(fn(onCancel));
        promise.cancel = cancel;
        this.setContext(promise, cancel);
        this.after(promise, () => this.deleteContext(promise));
        return promise;
    }

    /**
     * Given a PromiseThunkFactory which accepts on `onCancel` hook, returns a PerishablePromise.
     *
     * @function Perishable
     * @param {function} PromiseThunkFactory
     * @returns {PerishablePromise} A `PerishablePromise` is a `CancellablePromise` which will be automatically cancelled after a specified amount of time.
     */
    Perishable(fn, ms) {
        const promise = this.Cancellable(fn);
        const handle = setTimeout(() => this.cancel(promise, new TimeoutError('Expired', ExpirationMessage(ms))), ms);
        this.after(promise, () => clearTimeout(handle));
        return promise;
    }

    /**
     * Given `promise` and `reason` calls canceller on `promise` with `reason`.
     *
     * @function cancel
     * @param {Promise} promise CancellablePromise to be cancelled
     * @param {'string' | 'Error'} reason reason for cancellation
     * @returns {void}
     */
    cancel(promise, reason) {
        const canceller = this.cancellers.get(promise);
        if (typeof canceller === 'function') canceller(reason);
    }

    /**
     * Calls `cancel` method with `reason` on every CancellablePromise associated with the context instance.
     *
     * @function cancelAll
     * @param {'string' | 'Error'} reason reason for cancellation
     * @returns {void}
     */
    cancelAll(reason) {
        this.cancellers.forEach(c => c(reason));
    }

    /**
     * A cancellable delay implementation which **resolves** after given number of milliseconds.
     *
     * @function delay
     * @param {number} ms Number of milliseconds to wait
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableDelay = context.Cancellable(context.delay(1500));
     * setTimeout(() => cancellableDelay.cancel(), 1000);
     * await cancellableDelay;
     */
    delay(ms) {
        return onCancel => {
            return new Promise((resolve, reject) => {
                const handle = setTimeout(() => resolve(), ms);
                onCancel(reason => {
                    clearTimeout(handle);
                    resolve(reason || ExpirationMessage(ms));
                });
            });
        };
    }

    /**
     * A cancellable timeout implementation which **resolves** after given number of milliseconds.
     *
     * @function timeout
     * @param {number} ms Number of milliseconds to wait
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableTimeout = context.Cancellable(context.delay(1500));
     * setTimeout(() => cancellableTimeout.cancel(), 1000);
     * await cancellableTimeout;
     */
    timeout(ms) {
        return onCancel => {
            return new Promise((resolve, reject) => {
                const handle = setTimeout(() => resolve(), ms);
                onCancel(reason => {
                    clearTimeout(handle);
                    reject(reason || new TimeoutError('Expired', ExpirationMessage(ms)));
                });
            });
        };
    }

    /**
     * A CancellableFactory which **resolves** after given number of milliseconds.
     *
     * @function CancellableDelay
     * @param {number} ms Number of milliseconds to wait
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableDelay = context.CancellableDelay(1500));
     * setTimeout(() => cancellableDelay.cancel(), 1000);
     * await cancellableDelay;
     */
    CancellableDelay(ms) {
        return this.Cancellable(this.delay(ms));
    }

    /**
     * A CancellableFactory which **rejects** after given number of milliseconds.
     *
     * @function CancellableTimeout
     * @param {number} ms Number of milliseconds to wait
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableTimeout = context.CancellableTimeout(1500));
     * setTimeout(() => cancellableTimeout.cancel(), 1000);
     * await cancellableTimeout;
     */
    CancellableTimeout(ms) {
        return this.Cancellable(this.timeout(ms));
    }

    /**
     * A PerishableFactory which **rejects** after given number of milliseconds.
     *
     * @function PerishableTimeout
     * @param {number} ms Number of milliseconds to wait
     * @param {number} ttl Number of milliseconds until cancelled
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableTimeout = context.PerishableTimeout(1500, 1000);
     * await cancellableTimeout;
     */
    PerishableTimeout(ms, ttl) {
        return this.Perishable(this.timeout(ms), ttl);
    }

    /**
     * A PerishableFactory which resolves after given number of milliseconds.
     *
     * @function PerishableDelay
     * @param {number} ms Number of milliseconds to wait
     * @param {number} ttl Number of milliseconds until cancelled
     * @returns {function} Returns function which accepts `onCancel` hook.
     * @example
     *
     * const cancellableDelay = context.PerishableDelay(1500, 1000);
     * await cancellableDelay;
     */
    PerishableDelay(ms, ttl) {
        return this.Perishable(this.delay(ms), ttl);
    }

    setContext(promise, cancel) {
        this.cancellers.set(promise, cancel);
    }

    deleteContext(promise) {
        this.cancellers.delete(promise);
    }

    createHooks() {
        let cancel;
        const cancelled = new Promise(resolve => cancel = reason => resolve(reason || new CancellationError('Cancelled')));
        const onCancel = fn => cancelled.then(fn);
        return [ cancel, onCancel ];
    }

    after(promise, fn) {
        promise.then(fn).catch(fn);
    }

}

function CancellationContextFactory(...args) {
    return new CancellationContext(...args);
}

module.exports = CancellationContextFactory;
module.exports.CancellationError = CancellationError;
module.exports.TimeoutError = TimeoutError;
