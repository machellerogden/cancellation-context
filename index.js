'use strict';

const sleep = ms => new Promise(r => setTimeout(() => r(), ms));

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
        this.cancellers.get(context)();
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

    cancellable(fn, ttl) {
        let cancel;
        const cancelled = new Promise(resolve => cancel = error => resolve(error || new CancellationError('Cancelled')));
        const context = fn({ cancelled }).then(v => (this.deleteContext(context), v));
        if (ttl) sleep(ttl).then(() => cancel(new TimeoutError('Expired', `${ttl}ms TTL surpassed.`)));
        this.setContext(context, cancel);
        return context;
    }

}

module.exports = CancellationContext;
