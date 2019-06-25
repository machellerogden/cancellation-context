'use strict';

const CancellationContext = require('..');

function sleep(ms, cancelled) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => {
            console.log('done');
            resolve('success');
        }, ms);
        cancelled.then(error => {
            clearTimeout(t);
            reject(error);
        });
    });
}

(async () => {

    const c = new CancellationContext();

    async function* loop() {
        while (true) {
            const promises = [
                c.cancellable(cancelled => sleep(500, cancelled)),
                c.cancellable(cancelled => sleep(1000, cancelled)), // { ttl: 900 }), // try adding a ttl
                c.cancellable(cancelled => sleep(1500, cancelled))
            ];
            yield await Promise.all(promises);
        }
    }

    setTimeout(() => c.cancelAll(), 4000);

    try {
        for await (const result of loop()) {
            console.log(result);
        }
    } catch (e) {
        c.cancelAll();
        console.error('Boom!', e);
        process.exit(1);
    }

})();