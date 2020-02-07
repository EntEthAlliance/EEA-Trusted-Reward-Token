import Web3 from 'web3';
import { getWeb3 } from '../utils/getWeb3';


const addresses = {    
    EEthereumDIDRegistry: process.env.CONTRACT_EEthereumDIDRegistry,
    EEthereumClaimsRegistry: process.env.CONTRACT_EEthereumClaimsRegistry,
    EEAClaimsIssuer: process.env.CONTRACT_EEAClaimsIssuer,
    EEAOperator: process.env.CONTRACT_EEAOperator,   
};


import EthereumClaimsRegistryJson from '../contracts/EthereumClaimsRegistry.json';
import EEAClaimsIssuerJson from '../contracts/EEAClaimsIssuer.json';
import EEAOperatorJson from '../contracts/EEAOperator.json'
import EthereumDIDRegistryJson from '../contracts/EthereumDIDRegistry.json';
import ReputationTokenJson from '../contracts/ReputationToken.json'
import RewardTokenJson from '../contracts/RewardToken.json'
import PenaltyTokenJson from '../contracts/PenaltyToken.json'

let gasLimit = 100000;

(async function () { 
    let web3 = await getWeb3();
    gasLimit = (await web3.eth.getBlock("latest", false)).gasLimit;
    console.log('gasLimit:', gasLimit); 
})();


function setDefaults(contract) {
    contract.options.gas = gasLimit;   
    return contract;
}

export async function EthereumClaimsRegistryContract(web3:Web3):Promise<any> {      
    let contract = new web3.eth.Contract(EthereumClaimsRegistryJson.abi, addresses.EEthereumClaimsRegistry);            
    return setDefaults( contract);
}

export async function EEAClaimsIssuerContract(web3: Web3): Promise<any>{   
    let contract = new web3.eth.Contract(EEAClaimsIssuerJson.abi, addresses.EEAClaimsIssuer);
    return setDefaults( contract);   
}

export async function EEAOperatorContract(web3: Web3): Promise<any> {    
    let contract = new web3.eth.Contract(EEAOperatorJson.abi, addresses.EEAOperator);
    return setDefaults( contract);
}

export async function EthereumDIDRegistryContract(web3: Web3): Promise<any> {
    let contract = new web3.eth.Contract(EthereumDIDRegistryJson.abi, addresses.EEthereumDIDRegistry);
    return setDefaults(contract);
}

export async function ReputationTokenContract(web3: Web3): Promise<any> {
    const operator = await EEAOperatorContract(web3);
    const tokenAddr = await operator.methods.reputationToken().call();    
    const contract = new web3.eth.Contract(ReputationTokenJson.abi, tokenAddr);
    return setDefaults(contract);
}

export async function RewardTokenContract(web3: Web3): Promise<any> {
    const operator = await EEAOperatorContract(web3);
    const tokenAddr = await operator.methods.rewardToken().call();    
    const contract = new web3.eth.Contract(RewardTokenJson.abi, tokenAddr);    
    return setDefaults(contract);
}

export async function PenaltyTokenContract(web3: Web3): Promise<any> {
    const operator = await EEAOperatorContract(web3);
    const tokenAddr = await operator.methods.penaltyToken().call();    
    const contract = new web3.eth.Contract(PenaltyTokenJson.abi, tokenAddr);
    return setDefaults(contract);
}


