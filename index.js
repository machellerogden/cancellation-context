'use strict';

const delay = ms => new Promise(r => setTimeout(() => r(), ms));
const forever = () => Promise.race([]);
const tap = fn => v => (fn(), v);

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

    cancellable(fn, { ttl } = {}) {
        let cancel;
        const cancelled = new Promise(resolve => cancel = error => resolve(error || new CancellationError('Cancelled')))
        const promise = fn(cancelled).then(tap(() => this.deleteContext(context)));
        const context = ttl
            ? Promise.race([
                promise,
                delay(ttl)
                    .then(() => cancel(new TimeoutError('Expired', `${ttl}ms TTL surpassed.`)))
                    .then(forever)
            ])
            : promise;
        this.setContext(context, cancel);
        return context;
    }

}

module.exports = CancellationContext;
