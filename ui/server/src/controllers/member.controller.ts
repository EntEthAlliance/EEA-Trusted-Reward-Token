import { Request, Response } from 'express';
import { getWeb3, getMemberWeb3 } from '../utils/getWeb3';
import * as contracts from '../utils/contracts'
import * as db from '../utils/database'; 
import { ResultOk } from '../utils/result';
import { Keccak } from 'sha3';
import { getCurrentUser } from '../utils/user';
import { getRewardBallance, numberToToken, syncMemberBalance} from '../utils/eth-workers'

import Joi from '@hapi/joi';

interface EmployeeRegistreRequest {
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



export async function getAllEmployeesList(req: Request, res: Response) {    
    const membersList = await db.getEmployeeList();
    const employees = membersList.map(function (m) {
        return {
            id: m.id,
            parentid: m.parentid,
            parentname:m.parentname,
            name: m.name,
            EEAReputation: m.eeareputation || 0,
            email: m.login,
            regdate: m.regdate || null
        };
    });   
    res.send(employees);
}

export async function getEmployeesList(req: Request, res: Response) {
    let memberId = parseInt(req.params.member);
    const membersList = await db.getEmployeeListByMemberId(memberId);

    const employees = membersList.map(function (m) {
        return {
            id: m.id,
            parentid: m.parentid,
            parentname: m.parentname,
            name: m.name,
            EEAReputation: m.eeareputation || 0,
            email: m.login,
            regdate: m.regdate || null
        };
    });
    res.send(employees);
}

export async function getMembersList(req: Request, res: Response) {
    
    const membersList = await db.getMemberList();
    const members = membersList.map(function (m) {
        return {
            id: m.id,
            name: m.name,
            EEAReputation: m.eeareputation || 0,
            email: m.login
        };
    });
    res.send(members);
}

export async function getRequestsList(req: Request, res: Response) {
    const currUser = await getCurrentUser(res);
    if (!currUser) {
        res.status(401).send('Unknown member'); return;
    }
    const list = await db.getReqestsListForMember(currUser.id);

    let requests = list.map(r => <any>{ 
        id: r.id,
        type: r.requesttype == 'redeem' ? 'EEA Token Redemption' : 'EEA Token Share',
        date: r.regdate,
        status: (!r.completedate) ? 'Pending' : (r.iscomplete ? 'Completed':'Rejected'),
        tokencount:r.tokencount
    });    
    

    res.send(requests);
}


export async function getBalance(req: Request, res: Response) {
    try {
        const currUser = await getCurrentUser(res);
        if (!currUser) {
            res.status(401).send('Unknown member'); return;
        }      
            
        const balance = await syncMemberBalance(currUser.id);
        
        let result = {
            EEAReward: balance.EEAReward,
            EEAPenalty: balance.EEAPenalty,
            EEAReputation: balance.EEAReputation
        };
       
        res.send(result);        
    }
    catch (err) { 
        res.status(500).send(err);
    }
}

export async function getRedeemForList(req: Request, res: Response) {
    const list = await db.getRedeemForList();
    res.send(list);
}

interface ReedemTokenRequest { 
    redeemforid: number,
    redeemforcount: number
}

export async function reedemToken(req: Request, res: Response) {    
    try {
        const currUser = await getCurrentUser(res);
        if (!currUser) {
            res.status(401).send('Unknown member'); return;
        }

        let data = <ReedemTokenRequest>req.body;
        const redeemFor = await db.getRedeemForById(data.redeemforid);
        if (!redeemFor) {
            res.status(400).send('Unknown redeem for with id=' + data.redeemforid); return;
        }

        const redeemReq = <db.RedeemRequest>{
            redeemforid: redeemFor.id,
            redeemcount: data.redeemforcount,
            tokencount: data.redeemforcount * redeemFor.tokencount,
            memberid: currUser.id
        };    
    
        const save = await db.addRedeemRequest(redeemReq);
        res.send({ success: true });
    }
    catch (err) { 
        res.status(500).send(err); return;
    }
}


interface ShareTokenRequest {
    sharetoid: number,
    tokencount: number
}

export async function shareToken(req: Request, res: Response) {
    try {
        const currUser = await getCurrentUser(res);
        if (!currUser) {
            res.status(401).send('Unknown member'); return;
        }

        let data = <ShareTokenRequest>req.body;
        const toUser = await db.getUserById(data.sharetoid);
        if (!toUser) {
            res.status(400).send('Unknown user for share with id=' + data.sharetoid); return;
        }

        try {
            const web3 = await getMemberWeb3(currUser.id);
            const RewardTokenContract = await contracts.RewardTokenContract(web3);
            const memberAcc = (await web3.eth.getAccounts())[0];

            const balanceBefore = await getRewardBallance(memberAcc, RewardTokenContract);
            console.log('balanceBefore', balanceBefore);
            if (balanceBefore < data.tokencount) {
                res.status(400).send('Insufficient funds'); return;
            }

            const approve = await RewardTokenContract.methods.approve(memberAcc, numberToToken(data.tokencount)).send({ from: memberAcc });
            const result = await RewardTokenContract.methods.transfer(toUser.chainid, numberToToken(data.tokencount)).send({ from: memberAcc});
            
            const balanceAfter = await getRewardBallance(memberAcc, RewardTokenContract);
            console.log('balanceAfter', balanceAfter);
        }
        catch (err) { 
            console.error('Call blockchain:', err);
            res.status(500).send(err);
            return;
        }

        //Save history to DB
        const shareReq = <db.ShareRequest>{
            sharetoid: toUser.id,           
            tokencount: data.tokencount,
            memberid: currUser.id
        };


        const save = await db.addShareRequest(shareReq);
        await syncMemberBalance(currUser.id);
        await syncMemberBalance(toUser.id);        
        res.send({ success: true });

    }
    catch (err) {
        res.status(500).send(err); return;
    }
}

export async function registerEmployee(req: Request, res: Response) {
    const currUser = await getCurrentUser(res);
    if (!currUser) {
        res.status(401).send('Unknown member'); return;
    }

    let data = <EmployeeRegistreRequest>req.body;
    let valid = await registerSchema.validate(data);
    console.log(valid);
    if (valid.error) {
        res.status(400).send(valid.error.details[0].message);
        return;
    }

    let dbUser = await db.getUserByLogin(data.email);

    if (dbUser != null) {
        res.status(400).send('User with email "' + data.email + '" already registered');
        return;
    }

    //Register in DB
    let user = <db.User>{
        name: data.name,
        login: data.email,
        role: 'employee',
        parentid: currUser.id,
        salt: Math.random().toString(36).substring(2, 15)
    };
    user.pwdhash = new Keccak(256).update(data.password).update(user.salt).digest('hex');

    console.log('save user');
    let stored = await db.addUser(user);


    const index = stored.id;
    //Register in-chain
    try {
        const memberAddress = currUser.chainid;

        const index = stored.id;
        let employeeWeb3 = await getMemberWeb3(index);
        let employeeAcc = (await employeeWeb3.eth.getAccounts())[0];

        const web3 = await getMemberWeb3(currUser.id); // Work with web3 as member org

        const EthereumDIDRegistry = await contracts.EthereumDIDRegistryContract(web3);

        const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e';//keccak256(employee)
        const validity = 1000000;
        let data = await EthereumDIDRegistry.methods.addDelegate(memberAddress, delegateType, employeeAcc, validity).send({ from: memberAddress });
        if (data.status == 0) {
            await db.deleteUserById(stored.id);
            res.status(400).send("Error while store employee in chain");
        }
        else {
            const event = data.events['DIDDelegateChanged'];
            if (!event)
                stored.chainid = employeeAcc;
            else {
                stored.chainid = event.returnValues.delegate;
            }
            stored = await db.updateUserChainData(stored);
            res.send(ResultOk());
        }
    }
    catch (err) {
        console.error('Register employee in blockchain', err)
        await db.deleteUserById(stored.id);
        res.status(400).send("Error while store employee in chain");
    }

}
