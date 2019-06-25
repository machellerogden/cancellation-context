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
        const context = c.cancellable(cancelled => sleep(1500, cancelled));
        setTimeout(() => c.cancel(context), 1000); // try increasing to 2000
        console.log('Success!', await context);
    } catch (e) {
        console.error('Boom!', e);
    }

})();
