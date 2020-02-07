import Web3 from 'web3';
import { getWeb3 } from '../utils/getWeb3';
import * as db from '../utils/database';
import * as contracts from '../utils/contracts';

const decimals = parseInt(process.env.TOKEN_DECIMALS) || 18;
console.log('TOKEN_DECIMALS=', process.env.TOKEN_DECIMALS);

let isActiveSyncBalances = false;

/**
 * Get event from transaction
 *
 * @param {object} tx Transaction object
 * @param {string} event Event searching for
 * @returns {object} Event stack
 */
export function getEvent(txdata, event: string) {
    if (!txdata || !txdata.events) return null;
    return txdata.events[event] || null;
}

export function tokenToNumber(token: string): number {   
    return parseInt((token||'0').padStart(decimals + 1, '0').slice(0, -decimals));
}

export function numberToToken(tokenNumber: number): string { 
    return '' + tokenNumber + ''.padEnd(decimals, '0');
}

export async function getMemberBallance(address: string): Promise<db.BalanceItem> { 
    const web3 = await getWeb3();
    const ReputationTokenContract = await contracts.ReputationTokenContract(web3);
    const RewardTokenContract = await contracts.RewardTokenContract(web3);
    const PenaltyTokenContract = await contracts.PenaltyTokenContract(web3);

    let memberBalance = <db.BalanceItem>{ userid: null };
    memberBalance.EEAReputation = tokenToNumber(await ReputationTokenContract.methods.balanceOf(address).call());
    memberBalance.EEAReward = tokenToNumber(await RewardTokenContract.methods.balanceOf(address).call());
    memberBalance.EEAPenalty = tokenToNumber(await PenaltyTokenContract.methods.balanceOf(address).call());
    return memberBalance;
}

export async function getEmployeeBallance(address: string): Promise<db.BalanceItem> {
    const web3 = await getWeb3();
    const ReputationTokenContract = await contracts.ReputationTokenContract(web3);    

    let memberBalance = <db.BalanceItem>{ userid: null };
    memberBalance.EEAReputation = tokenToNumber(await ReputationTokenContract.methods.balanceOf(address).call());   
    return memberBalance;
}



export async function getRewardBallance(address: string, rewardTokenContract?:any): Promise<number> {
    if (!rewardTokenContract) {
        const web3 = await getWeb3();
        rewardTokenContract = await contracts.RewardTokenContract(web3);
    }

    const reward = tokenToNumber(await rewardTokenContract.methods.balanceOf(address).call());
    return reward;
}


export async function syncMemberBalance(userid: number): Promise<db.BalanceItem> { 
    const user = await db.getUserById(userid);
    if (!user) return;
    const memberBalance = await getMemberBallance(user.chainid);
    memberBalance.userid = user.id;
    db.updateTokenBalance(memberBalance); 
    return memberBalance;
}

export async function syncEmployeeBalance(userid: number): Promise<db.BalanceItem> {
    const user = await db.getUserById(userid);
    if (!user) return;
    const employeeBalance = await getEmployeeBallance(user.chainid);
    employeeBalance.userid = user.id;
    db.updateTokenBalance(employeeBalance);
    return employeeBalance;
}

export async function syncBalances() { 

    if (isActiveSyncBalances) { 
        console.log('SyncBalances already started');
        return;
    }
    isActiveSyncBalances = true;

    try {
        
        const web3 = await getWeb3();
        const ReputationTokenContract = await contracts.ReputationTokenContract(web3);
        const RewardTokenContract = await contracts.RewardTokenContract(web3);
        const PenaltyTokenContract = await contracts.PenaltyTokenContract(web3);
    
        const members = await db.getMemberList();
        for (let m of members) {
            if (!m.chainid) continue;
            //Save member balance
            let memberBalance = <db.BalanceItem>{ userid: m.id };
            memberBalance.EEAReputation = tokenToNumber(await ReputationTokenContract.methods.balanceOf(m.chainid).call());
            memberBalance.EEAReward = tokenToNumber(await RewardTokenContract.methods.balanceOf(m.chainid).call());
            memberBalance.EEAPenalty = tokenToNumber(await PenaltyTokenContract.methods.balanceOf(m.chainid).call());
                       
            await db.updateTokenBalance(memberBalance);

            const employees = await db.getEmployeeListByMemberId(m.id);
            for (let e of employees) {
                //Save employee balance
                if (!e.chainid) continue;
                let emplBalance = <db.BalanceItem>{ userid: e.id };
                emplBalance.EEAReputation = tokenToNumber(await ReputationTokenContract.methods.balanceOf(e.chainid).call());
                await db.updateTokenBalance(emplBalance);
            }
        }

    } catch (err) { 
        console.error('syncBalances', err);
    }
    finally { isActiveSyncBalances = true; }

}

let timerBalancesWather = null;
export async function startBalancesWatcher() { 
    if (process.env.DISABLE_CHAIN_SYNC) { 
        console.log('Blockchain sync disabled by flag DISABLE_CHAIN_SYNC');
        return;
    }

    const interval = 20;
    const web3 = await getWeb3();
    const ReputationTokenContract = await contracts.ReputationTokenContract(web3);
    const RewardTokenContract = await contracts.RewardTokenContract(web3);
    const PenaltyTokenContract = await contracts.PenaltyTokenContract(web3);

    let lastBlock = await web3.eth.getBlockNumber();
    // startup sync
    await syncBalances();
    
    async function check() { 
        const prevBlock = lastBlock;
        lastBlock = await web3.eth.getBlockNumber();
        await syncByEvents({ fromBlock: prevBlock, toBlock: lastBlock });
        timerBalancesWather = setTimeout(check, interval*1000)
    }

    check();
}

export function stopBalancesWatcher(): void { 
    if (timerBalancesWather)
        clearTimeout(timerBalancesWather);
}

export interface SyncByEventsOptions { 
    fromBlock: number,
    toBlock:number
}

export async function syncByEvents(options: SyncByEventsOptions) { 
    //console.log('syncByEvents', options.fromBlock, options.toBlock);

    const web3 = await getWeb3();
    const ReputationTokenContract = await contracts.ReputationTokenContract(web3);
    const RewardTokenContract = await contracts.RewardTokenContract(web3);
    const PenaltyTokenContract = await contracts.PenaltyTokenContract(web3);  
    const zeroAddress = '0x0000000000000000000000000000000000000000';    

    let toSync = {};

    //Rewards
    {
        let events = await RewardTokenContract.getPastEvents('Transfer', options);
        events.forEach(e => {
            if (e.returnValues.from && e.returnValues.from != zeroAddress)
                toSync[e.returnValues.from] = 1;
            if (e.returnValues.to && e.returnValues.to != zeroAddress)
                toSync[e.returnValues.to] = 1;
        });
    }
    //Reputation
    {
        let events = await ReputationTokenContract.getPastEvents('Transfer', options);
        events.forEach(e => {
            if (e.returnValues.from && e.returnValues.from != zeroAddress)
                toSync[e.returnValues.from] = 1;
            if (e.returnValues.to && e.returnValues.to != zeroAddress)
                toSync[e.returnValues.to] = 1;
        });
    }
    //Penalty
    {
        let events = await PenaltyTokenContract.getPastEvents('Transfer', options);
        events.forEach(e => {
            if (e.returnValues.from && e.returnValues.from != zeroAddress)
                toSync[e.returnValues.from] = 1;
            if (e.returnValues.to && e.returnValues.to != zeroAddress)
                toSync[e.returnValues.to] = 1;
        });
    }

    let users = [];
    for (let chaind in toSync) {         
        const user = await db.getUserByChainId(chaind);
        if (!user) return;

        if (user.role == 'member')
            await syncMemberBalance(user.id);
        else if (user.role == 'employee')
            await syncEmployeeBalance(user.id);
        users.push(user);
    }

    return users;
}
