import assert from 'assert'
import {parse} from './nanolisp.js';

test('basic parsing', () => {
    let parsed = parse("21436");
    assert.deepStrictEqual(parsed, 21436);
});
test('basic parsing', () => {
    let parsed = parse("(begin (define r 10) (* pi (* r r)))");
    assert.deepStrictEqual(parsed, ['begin', ['define', 'r', 10], ['*', 'pi', ['*', 'r', 'r']]]);
});