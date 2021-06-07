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

export const standardEnv = (() => {
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
    env['car'] = (a) => a;
    env['cdr'] = (a, ...b) => b;
    env['cons'] = (a, b) => [...a, ...b];
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

    return env;
})();

export const nanoEval = (x, env=standardEnv) => {
    if(typeof x === 'string') {
        return env[x];
    }
    if(!isNaN(x)) {
        return x;
    }
    if(x[0] === 'if') {
        let [_, test, conseq, alt] = x;
        let exp = nanoEval(test) ? conseq : alt;
        return nanoEval(exp, env);
    }
    if(x[0] === 'define') {
        let [_, symbol, exp] = x;
        env[symbol] = nanoEval(exp, env);
        return undefined;
    }
    let proc = nanoEval(x[0], env);
    let [head, ...tail] = x;
    let args = tail.map(arg => nanoEval(arg, env));
    return proc(...args);
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
                    console.log(nanoEval(parse(answer)));
                } catch (e) {
                    console.error(e);
                }
                resolve();

            });
        });
    }
}