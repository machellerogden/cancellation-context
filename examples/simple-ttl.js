'use strict';

const CancellationContext = require('..');

function sleep(ms, cancelled) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve('success'), ms);
        cancelled.then(error => {
            clearTimeout(t);
            reject(error);
        });
    });
}

(async () => {

    const c = new CancellationContext();

    try {
        const ttl = 1000; // try increasing to 2000
        console.log(await c.cancellable(cancelled => sleep(10000, cancelled), { ttl }));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
