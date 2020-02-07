import { Request, Response } from 'express';
import { getWeb3, getMemberWeb3 } from '../utils/getWeb3'; 
import * as contracts from '../utils/contracts';
import * as db from '../utils/database';
import { syncByEvents, startBalancesWatcher } from '../utils/eth-workers';


export async function getStatus(req: Request, res: Response) { 
  let result = {
    status: true,
    blockchain: false,
    database:false
  };
  try {
    const web3 = await getWeb3();
    const lastBlock = await web3.eth.getBlockNumber();
    result.blockchain = true;
  }
  catch (err) { 
    result.blockchain = false;
  }
  try {
    const web3 = await db.ping();
    result.database = true;

  }
  catch (err) {
    result.database = false;
  }

  res.send(result)
}

export async function reRegisterUsers(req: Request, res: Response) {   

  let web3 = await getWeb3();   
  let EEAClaimsIssuerContract = await contracts.EEAClaimsIssuerContract(web3);  
  
  let adminAcc = (await web3.eth.getAccounts())[0];

  
  const membershipClaim = '0xe4d89b09a6eb94125ee9c6123f55fbaef99eabb81fcefd76640abb9269a84805'; // keccak256(membership) 
  const claimValue = '0x6273151f959616268004b58dbb21e5c851b7b8d04498b4aabee12291d22fc034'; // keccak256(true)
  const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e'; // keccak256(employee)
  const validity = 1000000;


  let mint = [];
  let members = await db.getMemberList();

  //members = members.slice(0, 1);

  for (let m of members) { 
    if (!m.chainid) continue;
    let memberWeb3 = await getMemberWeb3(m.id);
    let memberAcc = (await memberWeb3.eth.getAccounts())[0];
    let regOrg = await EEAClaimsIssuerContract.methods.setMembershipClaim(memberAcc).send({ from: adminAcc });
    console.log('Register member', m.login);
   
    let EthereumDIDRegistryContract = await contracts.EthereumDIDRegistryContract(memberWeb3);
    const employees = await db.getEmployeeListByMemberId(m.id);
    for (let e of employees) {
      if (!e.chainid) continue;
      let regEmpl = await EthereumDIDRegistryContract.methods.addDelegate(memberAcc, delegateType, e.chainid, validity).send({ from: memberAcc });
      console.log('Register employee', e.login);
    }
  }

  res.send('Ok');
}

export async function mintRewards(req: Request, res: Response) {
  let memberWeb3 = await getMemberWeb3(2);
  let memberAcc = (await memberWeb3.eth.getAccounts())[0];

  let web3 = await getWeb3();
  let EEAOperator = await contracts.EEAOperatorContract(web3);
  let EthereumClaimsRegistryContract = await contracts.EthereumClaimsRegistryContract(web3);
  let EEAClaimsIssuerContract = await contracts.EEAClaimsIssuerContract(web3);
  let EthereumDIDRegistryContract = await contracts.EthereumDIDRegistryContract(memberWeb3);
  let ReputationTokenContract = await contracts.ReputationTokenContract(web3);
  let adminAcc = (await web3.eth.getAccounts())[0];

  const org1 = '0x3748cBA2d0B7651D2bBcD7674F12A4024c5663E9';
  const org2 = '0x47212713331c7363E42374d72D9d6C65F33d7680';
  const empl1org1 = '0xd3EEa03617Dc60940398C61c49D4b11B10Cf26f6';
  const empl2org1 = '0x3FD99f3127b93dC878D438409708855F06eb640a';
  const emplOther = '0x575A8d9FeF113d57c3B51556Aa9A8fa90886767a';
  const oneToken = '1'.padEnd(18, '0');
  const amountArray = [oneToken, oneToken];
  const toArray = [empl1org1, empl2org1];
  const orgArray = [org1, org1];

  const membershipClaim = '0xe4d89b09a6eb94125ee9c6123f55fbaef99eabb81fcefd76640abb9269a84805'; // keccak256(membership) 
  const claimValue = '0x6273151f959616268004b58dbb21e5c851b7b8d04498b4aabee12291d22fc034'; // keccak256(true)
  const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e'; // keccak256(employee)
  const validity = 1000000;

 
  let mint = [];
  let members = await db.getMemberList();

  //members = members.slice(0, 1);

  for (let m of members) {
    const employees = await db.getEmployeeListByMemberId(m.id);
    for (let e of employees) {
      let item = {
        member: m.chainid,
        employee: e.chainid,
        token: '' + (Math.floor(Math.random() * 20 + 1) * 1) + ''.padEnd(18, '0')
      };
      mint.push(item);
    }
  }

  let orgs = [];
  let empl = [];
  let tokens = [];

  for (let r of mint) {
    orgs.push(r.member);
    empl.push(r.employee);
    tokens.push(r.token);    
  }

  try {
    let data = await EEAOperator.methods.batchMintRewards(orgs, empl, tokens).send({ from: adminAcc });
    res.send(data);
  }
  catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
  
  res.send('Ok')
 
}
