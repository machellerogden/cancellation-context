'use strict';

const context = require('..')();

(async () => {

    try {
        const ttl = 1000; // try increasing to 10000
        console.log(await context.perishable(cancelled => context.delay(1500, cancelled).then(() => 'success'), ttl));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
