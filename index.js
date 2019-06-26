'use strict';

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

    cancel(promise, error) {
        const canceller = this.cancellers.get(promise);
        if (typeof canceller === 'function') canceller(error);
    }

    cancelAll() {
        this.cancellers.forEach(c => c());
    }

    setContext(promise, cancel) {
        this.cancellers.set(promise, cancel);
    }

    deleteContext(promise) {
        this.cancellers.delete(promise);
    }

    createToken() {
        let cancel;
        const cancelled = new Promise(resolve => cancel = error => resolve(error || new CancellationError('Cancelled')));
        return [ cancel, cancelled ];
    }

    after(promise, fn) {
        promise.then(fn).catch(fn);
    }

    cancellable(fn) {
        const [ cancel, cancelled ] = this.createToken();
        const promise = fn(cancelled);
        this.setContext(promise, cancel);
        this.after(promise, () => this.deleteContext(promise));
        return promise;
    }

    delay(ms) {
        return function (cancelled) {
            return new Promise((resolve, reject) => {
                const handle = setTimeout(() => resolve(), ms);
                cancelled.then(error => {
                    clearTimeout(handle);
                    reject(error);
                });
            });
        }
    }

    perishable(fn, ttl) {
        const promise = this.cancellable(fn);
        const handle = setTimeout(() => this.cancel(promise, new TimeoutError('Expired', `${ttl}ms TTL surpassed`)), ttl);
        this.after(promise, () => clearTimeout(handle));
        return promise;
    }

}

function CancellationContextFactory(...args) {
    return new CancellationContext(...args);
}

module.exports = CancellationContextFactory;
