'use strict';

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

    after(context, fn) {
        context.then(tap(fn)).catch(tap(fn));
    }

    cancellable(fn) {
        const [ cancel, cancelled ] = this.createToken();
        const context = fn(cancelled);
        this.setContext(context, cancel);
        this.after(context, () => this.deleteContext(context));
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
        const context = this.cancellable(fn);
        const handle = setTimeout(() => this.cancel(context), ttl);
        this.after(context, () => clearTimeout(handle));
        return context;
    }

}

module.exports = CancellationContext;
