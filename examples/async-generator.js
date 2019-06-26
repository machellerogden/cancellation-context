'use strict';

const context = require('..')();

(async () => {

    async function* loop() {
        while (true) {
            const promises = [
                context.cancellable(cancelled => context.delay(500, cancelled).then(() => (console.log('done'),'success'))),
                context.cancellable(cancelled => context.delay(1000, cancelled).then(() => (console.log('done'),'success'))),
                context.cancellable(cancelled => context.delay(1500, cancelled).then(() => (console.log('done'),'success')))
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
        process.exit(1);
    }

})();
