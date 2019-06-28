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

    cancel(promise, reason) {
        const canceller = this.cancellers.get(promise);
        if (typeof canceller === 'function') canceller(reason);
    }

    cancelAll(reason) {
        this.cancellers.forEach(c => c(reason));
    }

    setContext(promise, cancel) {
        this.cancellers.set(promise, cancel);
    }

    deleteContext(promise) {
        this.cancellers.delete(promise);
    }

    createToken() {
        let cancel;
        const cancelled = new Promise(resolve => cancel = reason => resolve(reason || new CancellationError('Cancelled')));
        const onCancel = fn => cancelled.then(fn);
        return [ cancel, onCancel ];
    }

    after(promise, fn) {
        promise.then(fn).catch(fn);
    }

    cancellable(fn) {
        const [ cancel, onCancel ] = this.createToken();
        const promise = fn(onCancel);
        promise.cancel = reason => this.cancel(promise, reason);
        this.setContext(promise, cancel);
        this.after(promise, () => this.deleteContext(promise));
        return promise;
    }

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

    perishable(fn, ms) {
        const promise = this.cancellable(fn);
        const handle = setTimeout(() => this.cancel(promise, new TimeoutError('Expired', ExpirationMessage(ms))), ms);
        this.after(promise, () => clearTimeout(handle));
        return promise;
    }

}

function CancellationContextFactory(...args) {
    return new CancellationContext(...args);
}

module.exports = CancellationContextFactory;
