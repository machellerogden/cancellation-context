const CancellationContext = require('..');
const context = CancellationContext();

const MyCancellableFactory = msg => onCancel => new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(msg), 1000);
    onCancel(reason => {
        clearTimeout(t);
        resolve(reason);
    });
});

(async () => {
    const myCancellable = context.Cancellable(MyCancellableFactory('success!'));
    setTimeout(() => myCancellable.cancel('cancelled!'), 500);
    console.log(await myCancellable); // => 'cancelled!'
})();
