'use strict';

//function delay({ ttl, onCancel }) {
    //return new Promise((resolve, reject) => {
        //const t = setTimeout(() => resolve(), ttl);
        //onCancel.then(error => {
            //clearTimeout(t);
            //reject(new Error(error));
        //});
    //});
//}

class CancellationContext {

    constructor() {
        this.cancellers = new Map();
    }

    cancel(context) {
        this.cancellers.get(context)();
    }

    cancelAll() {
        this.cancellers.forEach(c => c());
    }

    setContext(context, cancel) {
        this.cancellers.set(context, cancel);
    }

    deleteContext(context) {
        this.cancellers.delete(context);
    }

    cancellable(fn) {
        let cancel;
        const onCancel = new Promise(r => cancel = r);
        const context = fn({ onCancel });
        this.setContext(context, cancel);
        context.then(() => this.deleteContext(context));
        return context;
    }

}

module.exports = CancellationContext;
