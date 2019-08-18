/**
 * Test procedure
 * For targeting the zombies, simply use: `lsof -i tcp:9545`
 *
 * @see https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a
 */
require('babel-register');
require('babel-polyfill');

import 'colors';

// @see http://documentup.com/shelljs/shelljs#execcommand--options--callback

const spawn     = require('child_process').spawn;
const server    = spawn('babel-node', ['./tools/server.js']);
// let tests;
// const tests     = spawn('babel-node', ['./tools/tests.js']);

server.stdout.on('data', (data) => {
    console.log('stdout: ' + data.toString().yellow);
});

server.stderr.on('data', (data) => {
    console.log('stderr: ' + data.toString().red);
});

server.on('exit', (code) => {
    console.log(('child process exited with code ' + code.toString()).blue);
});

setTimeout((server) => {
    console.log('[running tests]');

    const tests = spawn('babel-node', ['./tools/tests.js']);

    tests.stdout.on('data', (data) => {
        console.log('stdout: ' + data.toString().yellow);
    });

    tests.stderr.on('data', (data) => {
        console.log('stderr: ' + data.toString().red);
    });

    tests.on('exit', (code) => {
        console.log(('child process exited with code ' + code.toString()).blue);
    });

    /**
     * Kill all child processes
     *
     * @returns {void}
     */
    function cleanExit() {
        server.kill();
        console.log('[server exited]'.green);

        tests.kill();
        console.log('[tests exited]'.green);

        process.exit();
    }

    process.on('SIGINT', cleanExit);    // Catch ctrl-c
    process.on('SIGTERM', cleanExit);   // Catch kill

    // process.exit();
    cleanExit();
}, 5000, server);
