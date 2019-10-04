import Web3 from 'web3';
import { getWeb3 } from '../utils/getWeb3';
import * as db from '../utils/database';
import * as contracts from '../utils/contracts';
import { tokenToNumber, numberToToken} from '../utils/eth-workers';

export async function MintTokens(employeeLogin:string, tokenCount:number) { 
    const web3 = await getWeb3();
    const adminAcc = (await web3.eth.getAccounts())[0];
    const EEAOperator = await contracts.EEAOperatorContract(web3);
   

    const tokens = numberToToken(tokenCount);
    const user = await db.getUserByLogin(employeeLogin);


    if (!user || !user.chainid)
        throw 'Wrong user login ' + employeeLogin;
    if (user.role != 'employee')
        throw 'User must have "employee" role';
    const member = await db.getUserById(user.parentid);
    if (!member || !member.chainid)
        throw 'Wrong user member org';
    
    let data = await EEAOperator.methods.batchMintRewards([member.chainid], [user.chainid], [tokens]).send({ from: adminAcc });   
}