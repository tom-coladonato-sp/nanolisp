// a la http://norvig.com/lispy.html

export const tokenize = str => {
    return str.replaceAll('(', ' ( ').replaceAll(')', ' ) ').trim().split(/ +/);
}

export const parse = prog => {
    return read_from_tokens(tokenize(prog));
}

export const read_from_tokens = tokens => {
    if( tokens.length === 0 ) {
        throw new SyntaxError("unexpected EOF");
    }
    let token = tokens.shift();
    if(token === '(') {
        const L = [];
        while ( tokens[0] !== ')') {
            L.push(read_from_tokens(tokens));
        }
        tokens.shift();
        return L;
    } else if (token === ')') {
        throw new SyntaxError('unexpected )');
    } else {
        return atom(token);
    }
}

export const atom = token => {
    if(isNaN(token)) {
        return token;
    } else {
        return Number(token);
    }
}

class Env { // a ChainMap
    constructor(params, args, outer = builtins) {
        if(params === null && args === null) { // root env
            this.map = outer;
        } else {
            if(params.length !== args.length) {
                throw new SyntaxError("mismatched params and args: p=" + params + ", a=" + args);
            }
            this.map = {};
            for (let i = 0; i < args.length; i++) {
                this.map[params[i]] = args[[i]];
            }
            this.outer = outer;
        }

    }
    get(key) {
        return key in this.map
            ? this.map[key]
            : this.outer !== undefined
                ? this.outer.get(key)
                : null;
    }
    put(key, value) {
        this.map[key] = value;
    }
}

class Proc {
    constructor(params, body, env) {
        this.params = params;
        this.body = body;
        this.env = env;
    }
    call(...args) {
        return nanoEval(this.body, new Env(this.params, args, this.env));
    }
}

export const builtins = (() => {
    const env = {};

    // I am lazy
    Reflect.ownKeys(Math).filter(k => typeof k !== "symbol").forEach(key => {
        env[key] = Math[key];
    });

    env['+'] = (a, b) => a + b;
    env['-'] = (a, b) => a - b;
    env['*'] = (a, b) => a * b;
    env['/'] = (a, b) => a / b;

    env['>'] = (a, b) => a > b;
    env['<'] = (a, b) => a < b;
    env['>='] = (a, b) => a >= b;
    env['<='] = (a, b) => a <= b;
    env['='] = (a, b) => a === b;

    env['append'] = (a, b) => {
        a.push(b);
        return a;
    };
    env['apply'] = (a, b) => a(b);
    env['begin'] = (a, b) => b;
    env['car'] = (a) => {
        return a[0];
    };
    env['cdr'] = (a) => {
        let [first, ...rest] = a;
        return rest;
    };
    env['cons'] = (a, b) => [...a, ...b];
    env['equal?'] = (a, b) => a === b;
    env['length'] = (a) => a.length;
    env['list'] = (...a) => [...a];
    env['list?'] = (a) => Array.isArray(a);
    env['map'] = (a, b) => b.map(a);
    env['not'] = (a) => !a;
    env['null?'] = (a) => (Array.isArray(a) && a.length === 0);
    env['number?'] = (a) => !isNaN(a);
    env['procedure?'] = a => a instanceof Function;
    env['symbol?'] = a => a instanceof String;
    env['globals'] = () => Object.keys(env);

    // we're just here so we show up in the globals list
    env['quote'] = () => SyntaxError("miscalled builtin");
    env['if'] = () => SyntaxError("miscalled builtin");
    env['set!'] = () => SyntaxError("miscalled builtin");
    env['lambda'] = () => SyntaxError("miscalled builtin");
    env['exit'] = () => SyntaxError("miscalled builtin");

    return new Env(null, null, env);
})();

export const nanoEval = (x, env= builtins) => {
    // console.log(JSON.stringify(x));
    // if(env.outer !== undefined) {
    //     console.log(env.map);
    // } else {
    //     console.log("ROOT");
    // }
    // console.log("=====");
    if(typeof x === 'string') {
        if (x[0] === '"' && x[x.length - 1] === '"') {
            return x;
        } else {
            return env.get(x);
        }
    } else if (!Array.isArray(x)) {
        return x;
    }

    let [op, ...args] = x;
    if (op === 'quote') {
        return args[0];
    } else if (op === 'if') {
        let [test, conseq, alt] = args;
        let testResult = nanoEval(test, env);
        if(Array.isArray(testResult) && testResult.length  === 0) { // empty list is falsy in lisp
            testResult = false;
        }
        let exp = testResult ? conseq : alt;
        return nanoEval(exp, env);
    } else if (op === 'define') {
        let [symbol, exp] = args;
        env.put(symbol, nanoEval(exp, env));
    } else if (op === 'set!') {
        let [symbol, exp] = args;
        env.get(symbol).put(symbol, nanoEval(exp, env));
    } else if (op === 'lambda') {
        let [params, body] = args;
        return new Proc(params, body, env);
    }  else if (op === 'exit') {
        process.exit(0);
    } else {
        let proc = nanoEval(op, env);
        let vals = args.map(arg => nanoEval(arg, env));
        if(proc instanceof Proc) {
            return proc.call(...vals);
        } else {
            try {
                return proc(...vals);
            } catch (e) {
                debugger;
            }
        }
    }
}

export const repl = async (prompt='nanolisp.js>') => {
    let readline = await import('readline');
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});

    while(true) {
        await new Promise((resolve, reject) => {
            rl.question(prompt, answer => {
                if(answer === 'exit') {
                    process.exit(0);
                }
                try {
                    let data = nanoEval(parse(answer));
                    if(data !== undefined) {
                        console.log(data);
                    }
                } catch (e) {
                    console.error(e);
                }
                resolve();
            });
        });
    }
}