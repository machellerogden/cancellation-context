'use strict';

const CancellationContext = require('..');

function sleep(ms, cancelled) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve('success'), ms);
        cancelled.then(error => {
            console.log('here');
            clearTimeout(t);
            reject(error);
        });
    });
}

(async () => {

    const c = new CancellationContext();

    try {
        const ttl = 1000; // try increasing to 2000
        console.log(await c.perishable(cancelled => c.delay(1500, cancelled).then(() => 'success'), ttl));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
