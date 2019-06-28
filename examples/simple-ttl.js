'use strict';

const context = require('..')();

(async () => {

    try {
        const ttl = 1000; // try increasing to 10000
        console.log(await context.PerishableTimeout(1500, ttl).then(() => 'success'));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
