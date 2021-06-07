import assert from 'assert'
import {tokenize} from './nanolisp.js';

test('basic tokenization', () => {
    let tokens = tokenize('baa baa  black    sheep');
    assert.deepStrictEqual(tokens, ['baa','baa','black','sheep']);
});

test('basic tokenization', () => {
    let tokens = tokenize('baa baa-black    sheep');
    assert.notDeepStrictEqual(tokens, ['baa','baa','black','sheep']);
});

test('fake lisp tokenization', () => {
    let tokens = tokenize("(begin (define r 10) (* pi (* r r)))");
    assert.deepStrictEqual(tokens, ['(', 'begin', '(', 'define', 'r', '10', ')', '(', '*', 'pi', '(', '*', 'r', 'r', ')', ')', ')'])
})