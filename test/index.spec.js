import test from 'ava';
import sinon from 'sinon';
import CancellationContext, { TimeoutError, CancellationError } from '..';

test.beforeEach(t => t.context = { sandbox: sinon.createSandbox() });
test.afterEach(t => t.context.sandbox.restore());

test('simple delay - happy', async t => {
    const context = CancellationContext();
    let result;
    try {
        result = await context.PerishableTimeout(150, 200).then(() => 'success');
    } catch (e) {}
    t.is(result, 'success');
});

test('simple delay - sad', async t => {
    const context = CancellationContext();
    const error = await t.throwsAsync(context.PerishableTimeout(150, 100).then(() => 'success'));
    t.is(error.name, 'TimeoutError');
    t.is(error.code, 'EXPIRED');
    t.is(error.message, 'Expired');
    t.is(error.cause, '100ms TTL surpassed');
});
