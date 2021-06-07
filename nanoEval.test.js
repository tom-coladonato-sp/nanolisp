import assert from 'assert'
import {parse, nanoEval} from './nanolisp';

test('basic nanoEval', () => {
    let parsed = nanoEval(parse("(begin (define r 10) (* PI (* r r)))"));
    assert.deepStrictEqual(parsed, 314.1592653589793);
});