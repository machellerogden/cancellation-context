'use strict';

const delay = ms => new Promise(r => setTimeout(() => r(), ms));
const forever = () => Promise.race([]);
const tap = fn => v => (fn(), v);
const tapReject = fn => e => (fn(), Promise.reject(e));

class CancellationError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, CancellationError);
        this.name = 'CancellationError';
        this.code = 'CANCELLED';
    }
}

class TimeoutError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, TimeoutError);
        this.name = 'TimeoutError';
        this.code = 'EXPIRED';
    }
}

class CancellationContext {

    constructor() {
        this.cancellers = new Map();
    }

    cancel(context) {
        const canceller = this.cancellers.get(context);
        if (typeof canceller === 'function') canceller();
    }

    cancelAll() {
        this.cancellers.forEach(c => c());
    }

    setContext(context, cancel) {
        this.cancellers.set(context, cancel);
    }

    deleteContext(context) {
        this.cancellers.delete(context);
    }

    createToken() {
        let cancel;
        const cancelled = new Promise(resolve => cancel = error => resolve(error || new CancellationError('Cancelled')));
        return [ cancel, cancelled ];
    }

    cancellable(fn) {
        const [ cancel, cancelled ] = this.createToken();
        const promise = fn(cancelled);
        const context = promise
            .then(tap(() => this.deleteContext(context)))
            .catch(tapReject(() => this.deleteContext(context)));
        this.setContext(context, cancel);
        return context;
    }

    delay(ms, cancelled) {
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => resolve(), ms);
            cancelled.then(error => {
                clearTimeout(handle);
                reject(error);
            });
        });
    }

    perishable(fn, ttl) {
        let handle;
        const context = this.cancellable(fn)
            //.then(tap(() => clearTimeout(handle)))
            //.catch(tapReject(() => clearTimeout(handle)));
        handle = setTimeout(() => this.cancel(context), ttl);
        return context;
    }

}

module.exports = CancellationContext;
