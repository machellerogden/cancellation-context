'use strict';

const context = require('..')();

(async () => {

    async function* loop() {
        while (true) {
            const promises = [
                context.CancellableTimeout(500).then(() => (console.log('done'), 'success')),
                context.CancellableTimeout(1000).then(() => (console.log('done'), 'success')),
                context.CancellableTimeout(1500).then(() => (console.log('done'), 'success'))
            ];
            yield await Promise.all(promises);
        }
    }

    setTimeout(() => context.cancelAll(), 4000);

    try {
        for await (const result of loop()) {
            console.log(result);
        }
    } catch (e) {
        context.cancelAll();
        console.error('Boom!', e);
    }

})();
