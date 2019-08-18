/**
 * Get some test ETH from ropsten
 * @see http://visionmedia.github.io/superagent/
 * @TODO: use proxy
 */
require('babel-register');
require('babel-polyfill');

process.exit();

import 'colors';
import {sleep} from '@validitylabs/js-utils';

console.log(sleep);

// const keythereum    = require('keythereum');
// const params    = { keyBytes: 32, ivBytes: 16 };
// const dk        = keythereum.create(params);
// const keyDump   = keythereum.dump("", dk.privateKey, dk.salt, dk.iv);
// const address   = '0x' + keyDump.address;
// const hexKey    = dk.privateKey.toString('hex');

// console.log(address);
// // web3.eth.sendTransaction({from: web3.eth.accounts[0], to: address, value: web3.toWei(1)});

const request       = require('superagent');
const url           = 'https://faucet.metamask.io/';
const accounts      = [
    '0x639A1dc3062444B30b7CA6A5E6e41090C3bCA13A',
    '0x0E8FF89069012133ea67c5a1bAC2Ff426EE28391',
    '0x2018FF438C45d5a2bBF0Ef511eACF0345eC1E1D1',
    '0x411A32aDD826cFaF159266A98A176A8C3CD088f3',
    '0x3707b30b3e7CCFc14f516DeBA2aFb7042BDC58EA',
    '0x961b7AC7ff495207C261C4b5A9656a7032b1e5f0',
    '0x11FCD9cE3763Bd38ed9cEC5318162C45cF4C3333',
    '0x59b67A5fc63aF132CcCDAE7e93dCF09E60f5190E',
    '0x1d0064059Aa8bb8A92f494bA0284E8F0B2Ea4CC3',
    '0xCCb50efc315614dF57f2C774391A3410B02F06EF',
    '0x7BeFB6B4eD33db5D7158988Ee69464d7aA35C0e6',
    '0x2335c6cef3B2f2Ec625Ec600b71cC102e538A131',
    '0xb07d7E9ef78eAB167362dbf034268C14B2AaaF60',
    '0xE76874548C0D580abbBeC466A9A5015579eF37b6',
    '0x07a56aB73D6efAC544de74f359225FFBB12AE600',
    '0xE7B8096e42FF32049Fe69982D2307a7551fBee41',
    '0xC382bb577f67e54796C1ac12d12F9f39F88d8D3a',
    '0xF00590148D5A35061D1Ff48109E2E3B3069BaF5d',
    '0x83DB8AD9F4cE41Be0f033a82B3640692dB82cb0a',
    '0x1EA0bbB4cbebD474FacCE06B82CC8b6E414a1578'
];

console.log('Requesting Ropsten ETH from faucet'.green);

// async function sleep(time) {
//     return new Promise(function (resolve) {
//         setTimeout(function () {
//             resolve();
//         }, time);
//     });
// }

// async function leech() {
//     for (let i = 0; i < accounts.length; i++) {
//         console.log('+++++++');

//         for (let c = 1; c <= 10; c++) {
//             await sleep(1000);
//             console.log((accounts[i]).yellow + ' : ' + c.toString().blue);
//         }
//     }
// }

// leech();

            // request
            //     .post(url)
            //     .type('application/rawdata')
            //     .end((error, result) => {
            //         if (error || !error.ok) {
            //             console.log(JSON.stringify(error).red);
            //         } else {
            //             JSON.stringify(result);
            //             // status 200 / 500
            //         }
            //     });
