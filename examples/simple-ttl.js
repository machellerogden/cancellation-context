'use strict';

const CancellationContext = require('..');

(async () => {

    const c = new CancellationContext();

    try {
        const ttl = 1000; // try increasing to 2000
        console.log(await c.perishable(cancelled => c.delay(1500, cancelled).then(() => 'success'), ttl));
    } catch (e) {
        console.error('Boom!', e);
    }

})();
