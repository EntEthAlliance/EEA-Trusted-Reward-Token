import Web3 from 'web3';
import Web3HDWalletProvider from "web3-hdwallet-provider";
import { HTTPProviderRateLimitRetry } from './http-provider-rate-limit-retry';



// Function for reading the app credentials from the keystore file
function getCredentials() {
    return {
        appCredentials: process.env.KALEIDO_APP_CREDENTIALS,
        connectionUrl: process.env.KALEIDO_CONNECTION_URL
    };
}

function getWeb3Url(): string { 
    if (!process.env.WEB3_URL || process.env.WEB3_URL =='') {
        let credentials = getCredentials();
        if (!credentials) {
            throw "Invalid credentials";
        }
        const url = 'https://' + credentials.appCredentials + '@' + credentials.connectionUrl;
        return url;
    }
    else { 
        return process.env.WEB3_URL;
    }

}

const mnemonic = 'wife lucky frog skate speed identify split reopen pig force pretty tell';

let instanse = null;
let memberInstanses: Array<Web3> = [];

function getHttpProvider(): any {    
    //let provider = new Web3.providers.HttpProvider(getWeb3Url());
    const provider = new HTTPProviderRateLimitRetry(getWeb3Url());    
    return provider;
}

export async function getWeb3():Promise<Web3> {    
    if (instanse == null){
        let provider = getHttpProvider();            
        instanse = new Web3(provider);            
    }        
    return instanse;    
}

export async function getMemberWeb3(index:number): Promise<Web3> { 
    if (!memberInstanses[index]) {
        let httpProvider = getHttpProvider();
        let provider = new Web3HDWalletProvider(mnemonic, httpProvider, index);
        memberInstanses[index] = new Web3(provider);
    } 

    return memberInstanses[index];
}
