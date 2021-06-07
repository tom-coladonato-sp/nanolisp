let tests = [];
let fails = [];

function test(name, fn) {
    tests.push({name, fn});
}

function run() {
    tests.forEach(test => {
        try {
            test.fn();
            console.log("PASSED: ", test.name);
        } catch (e) {
            console.log("FAILED: ", test.name);
            fails.push({test, e});
        }
    });
    if (fails.length > 0) {
        console.log("FAILURE REPORT:\n==========");
        console.log(tests.length - fails.length + " / " + tests.length + " TESTS PASSED");
        fails.forEach(fail => {
            console.log("FAILED: ", fail.test.name);
            console.log(fail.e.stack);
        });
        process.exit(1);
    }
    console.log(tests.length + " TESTS PASSED");
}

const files = process.argv.slice(2);

global.test = test;

await Promise.all(files.map(async file => {
    return await import(file);
}));

run();