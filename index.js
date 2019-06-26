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

    timeout(ttl) {
        let succeed;
        let fail;
        const handle = setTimeout(() => fail(), ttl);
        const delay = new Promise((resolve, reject) => {
            fail = () => reject(new TimeoutError('Expired', `${ttl}ms TTL surpassed.`));
            succeed = resolve;
        }).finally(() => clearTimeout(handle));
        return [ delay, succeed, fail ];
    }

    cancellable(fn, { ttl } = {}) {
        const [ cancel, cancelled ] = this.createToken();
        let context;
        const promise = fn(cancelled).then(tap(() => this.deleteContext(context)));
        if (ttl) {
            const [ delay, clear ] = this.timeout(ttl);
            context = Promise.race([
                promise,
                delay
            ]).then(tap(() => clear()))
              .catch(tapReject(() => clear()));
            this.setContext(context, cancel);
            return context;
        } else {
            context = promise;
            this.setContext(context, cancel);
            return context;
        }
    }

}

module.exports = CancellationContext;
