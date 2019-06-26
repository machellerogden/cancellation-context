'use strict';

const context = require('..')();

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

    try {
        const promise = context.cancellable(cancelled => sleep(1500, cancelled));
        const handle = setTimeout(() => context.cancel(promise), 1000); // try increasing to 10000
        console.log('Success!', await promise);
        clearTimeout(handle);
    } catch (e) {
        console.error('Boom!', e);
    }

})();
