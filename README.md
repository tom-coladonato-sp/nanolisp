# nanolisp.js

a la http://norvig.com/lispy.html

***
##### example usage
    sh-3.2# git add -A
    sh-3.2# npm run-script run
    
    > nanolisp@1.0.0 run
    > node index.js

    nanolisp.js>(globals)
    [
    'abs',     'acos',       'acosh',   'asin',    'asinh',
    'atan',    'atanh',      'atan2',   'ceil',    'cbrt',
    'expm1',   'clz32',      'cos',     'cosh',    'exp',
    'floor',   'fround',     'hypot',   'imul',    'log',
    'log1p',   'log2',       'log10',   'max',     'min',
    'pow',     'random',     'round',   'sign',    'sin',
    'sinh',    'sqrt',       'tan',     'tanh',    'trunc',
    'E',       'LN10',       'LN2',     'LOG10E',  'LOG2E',
    'PI',      'SQRT1_2',    'SQRT2',   '+',       '-',
    '*',       '/',          '>',       '<',       '>=',
    '<=',      '=',          'append',  'apply',   'begin',
    'car',     'cdr',        'cons',    'equal?',  'length',
    'list',    'list?',      'map',     'not',     'null?',
    'number?', 'procedure?', 'symbol?', 'globals', 'quote',
    'if',      'set!',       'lambda',  'exit'
    ]
    nanolisp.js>(if 1 0 1)
    0
    nanolisp.js>(if 0 0 1)
    1
    nanolisp.js>(if (>= (+ 5 3) (- 7 6)) (* 12 10) (/ 12 10))
    120
    nanolisp.js>(define sum (lambda (L) (if L (+ (car L) (sum (cdr L)) ) 0)))
    nanolisp.js>(sum (list 1 2 3 100))
    106
    nanolisp.js>exit
    sh-3.2#

(define sum (lambda (L) (if L (+ (car L) (sum (cdr L)) ) 0)))