/**
 * RPC server
 * @see https://github.com/trufflesuite/ganache-core/issues/11
 * @see http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
 */
require('babel-register');
require('babel-polyfill');

import 'colors';
import cnf from '../cnf.json';
import sh from 'shelljs';
import Ganache from 'ganache-core';
import Web3 from 'web3';

// Ensure a fresh DB folder is there
sh.rm('-fr', './db');
sh.mkdir('-p', './db');

const PORT = cnf.networks.develop.port;
const web3 = new Web3(new Web3.providers.HttpProvider('http://' + cnf.networks.develop.host + ':' + PORT));

const config = {
    logger: console,
    accounts: [
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        },
        {
            balance: '0xd3c21bcecceda0000000'
        }
    ],
    mnemonic: 'waste system voyage dentist fine donate purpose truly cactus chest coyote globe',
    port: PORT,
    locked: false,
    gasPrice: cnf.networks.develop.gasPrice,
    gasLimit: cnf.networks.develop.gas,
    network_id: cnf.networks.develop.chainId,
    db_path: './db/'
};

const server = Ganache.server(config);

server.listen(PORT, async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('[ Server is running ]'.green);
    console.log('mnemonic: ' + (config.mnemonic).yellow);
    console.log('accounts:');
    console.log(accounts);

    // console.log(await web3.eth.getBalance(accounts[0]));
});
