'use strict';

const context = require('..')();

const sleep = ms => onCancel => {
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve('success'), ms);
        onCancel(error => {
            clearTimeout(t);
            reject(error);
        });
    });
};

(async () => {

    try {
        const promise = context.Cancellable(sleep(1500));
        const handle = setTimeout(() => context.cancel(promise), 1000); // try increasing to 10000
        console.log('Success!', await promise);
        clearTimeout(handle);
    } catch (e) {
        console.error('Boom!', e);
    }

})();
