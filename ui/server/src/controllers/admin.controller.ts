import { Request, Response } from 'express';
import * as db from '../utils/database';
import { Keccak } from 'sha3';
import { getWeb3, getMemberWeb3 } from '../utils/getWeb3';
import * as contracts from '../utils/contracts';
import { ResultOk } from '../utils/result';
import { getCurrentUser } from '../utils/user';
import * as TEEClient from '../utils/tee'
import { getRewardBallance, numberToToken, syncMemberBalance, getEvent, syncBalances } from '../utils/eth-workers'

import Joi from '@hapi/joi';
import request = require('superagent');

interface MemberRegistreRequest {
    name: string,
    email: string,
    password: string
}

const registerSchema = Joi.object({
    name: Joi.string()        
        .min(3)
        .max(30)
        .required(),
    
    email: Joi.string()
        .email({ minDomainSegments: 2 }),

    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/).required()
})


export interface RedeemRequestItem { 
    id: number,
    name: string,
    type: string,
    date: Date    
}

export async function getRequestsList(req: Request, res: Response) {
    try {
        let requests = await db.getActiveRedeemRequestList();
    
        let mapped = requests.map(r => <RedeemRequestItem>{
            id: r.id,
            name: r.membername,
            type: 'EEA Token Redemption',
            date: r.regdate
        });
        
        res.send(mapped);
    }
    catch (err) { 
        res.status(500).send(err);
    }

}

export async function getRequest(req: Request, res: Response) {
    const requestid = parseInt(req.params.requestid);
    let request = await db.getRedeemRequestById(requestid);


    let result = <any>{
        id: request.id,
        member: request.membername,
        redeemfor: request.redeemforname,   
        redeemcount: request.redeemcount,
        tokencount: request.tokencount,
        type: 'EEA Token Redemption',
        date: request.regdate
    };

    res.send(result);
}

export async function getRewardReasons(req: Request, res: Response) { 
    let result = await db.getRewardReasons();    
    res.send(result);
}

interface ProcesRedeemRequest { 
    requestid: number,
    iscomplete: boolean
}

export async function processRedeem(req: Request, res: Response) {
    const data = <ProcesRedeemRequest>req.body;
    const request = await db.getRedeemRequestById(data.requestid);
    if (!request) { 
        res.status(400).send('Redeem request not found'); return;
    }
    if (request.completedate) {
        res.status(400).send('Redeem request already processed'); return;
    }
    if (data.iscomplete == false) { 
        await db.completeRedeemRequest(request.id, false);
        res.send(ResultOk());
        return;
    }


    const member = await db.getUserById(request.memberid); 
    if (!member) {
        res.status(401).send('Unknown member'); return;
    }
    try {
        const memberWeb3 = await getMemberWeb3(member.id);        
        const memberAcc = (await memberWeb3.eth.getAccounts())[0];

        const web3 = await getWeb3();        
        const adminAcc = (await web3.eth.getAccounts())[0];
        const RewardTokenContract = await contracts.RewardTokenContract(web3);
        const EEAOperatorContract = await contracts.EEAOperatorContract(web3);

        const balanceBefore = await getRewardBallance(memberAcc, RewardTokenContract);
        console.log('balanceBefore', balanceBefore);
        if (balanceBefore < request.tokencount) {
            res.status(400).send('Insufficient funds'); return;
        }

        const burnResult = await EEAOperatorContract.methods.burnRewards(memberAcc, numberToToken(request.tokencount), '0x0').send({ from: adminAcc });
        
        const event = getEvent(burnResult,'RewardsBurned');       
        if (!event)
            throw 'token not burned';

        const balanceAfter = await getRewardBallance(memberAcc, RewardTokenContract);
        console.log('balanceAfter', balanceAfter);
    }
    catch (err) {
        console.error('Call blockchain:', err);
        res.status(500).send(err);
        return;
    }
    await db.completeRedeemRequest(request.id, true);
    await syncMemberBalance(member.id);
    
    res.send(ResultOk());
}

export async function issueTokens(req: Request, res: Response) {
    let data = <TEEClient.IssueTokenRequest>req.body;
    let result = await TEEClient.SendTokenIssueRequest(data);
    console.log(result);
    
    res.send(ResultOk());

   
    
}

export async function registerMember(req: Request, res: Response) {
    let data = <MemberRegistreRequest>req.body;
    let valid = await registerSchema.validate(data);
    console.log(valid);
    if (valid.error) { 
        res.status(400).send(valid.error.details[0].message);
        return;
    }
    
    let dbUser = await db.getUserByLogin(data.email);
        
    if (dbUser != null) { 
        res.status(400).send('User with email "' + data.email+'" already registered');
        return;
    }

    //Register in DB
    let user = <db.User>{
        name: data.name,
        login: data.email,
        role: 'member',
        parentid:0,
        salt: Math.random().toString(36).substring(2, 15)
    };
    user.pwdhash = new Keccak(256).update(data.password).update(user.salt).digest('hex');

    console.log('save user');
    let stored = await db.addUser(user);

    //Register in-chain
    try
    {
        const membershipClaim = '0xe4d89b09a6eb94125ee9c6123f55fbaef99eabb81fcefd76640abb9269a84805'; // keccak256(membership) 
        const claimValue = '0x6273151f959616268004b58dbb21e5c851b7b8d04498b4aabee12291d22fc034'; // keccak256(true)


        const index = stored.id;
        let memberWeb3 = await getMemberWeb3(index);
        let memberAcc = (await memberWeb3.eth.getAccounts())[0];

        let web3 = await getWeb3();
        let EEAClaimsIssuer = await contracts.EEAClaimsIssuerContract(web3);

        let adminAcc = (await web3.eth.getAccounts())[0];
         
        let data = await EEAClaimsIssuer.methods.setMembershipClaim(memberAcc).send({ from: adminAcc });
        if (data.status == 0) {
            await db.deleteUserById(stored.id);
            res.status(400).send("Error while stored member in chain");
        }
        else { 
            const event = data.events['MemberShipAdded'];
            if (!event)
                stored.chainid = memberAcc;
            else {
                stored.chainid = event.returnValues.subject;                
            }
            stored = await db.updateUserChainData(stored);
            res.send(ResultOk());
        }        
    }
    catch (err) {
        console.error('Register member org in blockchain', err)
        await db.deleteUserById(stored.id);
        res.status(400).send("Error while stored member in chain");
    }
   
}

