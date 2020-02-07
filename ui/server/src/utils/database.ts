import pg from 'pg';

const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port:  parseInt(process.env.PG_PORT) || 5432,
})

export interface User { 
    id: number,
    name: string,
    role:string,
    login: string,
    salt: string,
    pwdhash: string,
    parentid:number,
    chainid:string
}

export interface ListItem {
    id: number,
    parentid: number,
    parentname:number,
    name: string,    
    login: string,
    eeareward: number,
    eeareputation: number,
    eeapenalty: number,
    regdate: Date,
    chainid:string
}

export interface RedeemRequest{ 
    id: number,
    memberid: number,   
    redeemforid: number,
    redeemcount: number,
    tokencount:number,
}

export interface ShareRequest {
    id: number,
    memberid: number,
    sharetoid: number,
    tokencount: number,
}

export interface RedeemForItem { 
    id: number,
    name: string,
    tokencount: number
}

export interface RedeemRequestItem { 
    id: number,
    memberid: number,
    membername: string,
    redeemforid: number,
    redeemforname: string,
    redeemcount: number,
    tokencount: number,
    regdate: Date,
    completedate: Date
}

export interface BalanceItem { 
    userid: number,
    EEAReward: number,
    EEAReputation: number,
    EEAPenalty: number,
}

export interface RequestListItem {    
    id: number,
    requesttype: string,
    regdate: Date,
    completedate: Date,
    iscomplete?:boolean,
    tokencount:number
}

export async function ping() { 
    const result = await pool.query('SELECT CURRENT_TIMESTAMP');    
    return result;
}

function returnSingle(result: pg.QueryResult<any>) { 
    if (result.rowCount > 0)
        return result.rows[0];
    else
        return null;
}

function returnMany(result: pg.QueryResult<any>){
    return result.rows;   
}


export async function getUserById(userId: number): Promise<any> {    
    let result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);    
    return returnSingle(result);
}

export async function deleteUserById(userId: number): Promise<any> {
    let result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return returnSingle(result);
}

export async function deleteUserByLogin(login: string): Promise<any> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await pool.query('DELETE FROM request WHERE memberid in (SELECT id FROM users WHERE LOWER(login) = LOWER($1))', [login]);
        await pool.query('DELETE FROM request WHERE sharetoid in (SELECT id FROM users WHERE LOWER(login) = LOWER($1))', [login]);
        let resTokens = await pool.query('DELETE FROM tokens WHERE userid in (SELECT id FROM users WHERE LOWER(login) = LOWER($1))', [login]);
        let result = await pool.query('DELETE FROM users WHERE LOWER(login) = LOWER($1)', [login]);        
        await client.query('COMMIT');
        return returnSingle(result);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    } finally {
        client.release()
    }

}
 
export async function getUserByLogin(login: string): Promise<User> {    
    let result = await pool.query('SELECT * FROM users WHERE LOWER(login) = LOWER($1)', [login]);
    return returnSingle(result);
}

export async function getUserByChainId(chainid: string): Promise<User> {
    let result = await pool.query('SELECT * FROM users WHERE LOWER(chainid) = LOWER($1)', [chainid]);
    return returnSingle(result);
}

export async function addUser(user:User): Promise<User> { 
    let result = await pool.query('INSERT INTO public.users ("name",login,"role",salt,pwdhash, parentid, chainid, regdate) VALUES' 
        + "($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)", [user.name, user.login, user.role, user.salt, user.pwdhash, user.parentid, user.chainid]);
    return await getUserByLogin(user.login);
} 

export async function updateUserChainData(user: User): Promise<User> {
    let result = await pool.query('UPDATE public.users SET chainid=$1 WHERE id=$2', [user.chainid, user.id]);
    return await getUserById(user.id);
} 


export async function getRewardReasons(): Promise<any> {
    let result = await pool.query('SELECT * FROM reward_reasons');    
    return returnMany(result);
}

export async function getRedeemForList(): Promise<RedeemForItem[]> {
    let result = await pool.query('SELECT * FROM list_redeemfor');
    return returnMany(result);
}

export async function getRedeemForById(id: number): Promise<RedeemForItem> {
    let result = await pool.query('SELECT * FROM list_redeemfor WHERE id=$1 ', [id]);
    return returnSingle(result);
}


export async function getMemberList(): Promise<ListItem[]>{
    let result = await pool.query("SELECT id, parentid, name, login, EEAReward, EEAReputation, EEAPenalty, chainid, regdate "
                                +" FROM users u left join tokens t on u.id = t.userid  where role = $1", ['member']);
    return returnMany(result);
}

export async function getEmployeeList(): Promise<ListItem[]> {
    let result = await pool.query("SELECT u.id, u.parentid, p.name as parentname, u.name, u.login, EEAReward, EEAReputation, EEAPenalty, u.chainid, u.regdate  "
        + " FROM users u join users p on p.id = u.parentid "
        + " left join tokens t on u.id = t.userid  where u.role = $1", ['employee']);
    console.debug('db:getEmployeeList');
    return returnMany(result);
}

export async function getEmployeeListByMemberId(memberid: number): Promise<ListItem[]> {
    let result = await pool.query("SELECT u.id, u.parentid, p.name as parentname, u.name, u.login, EEAReward, EEAReputation, EEAPenalty, u.chainid, u.regdate  "
        + " FROM users u join users p on p.id = u.parentid "
        + " left join tokens t on u.id = t.userid  where u.role = $1 and u.parentid=$2", ['employee', memberid]);
    return returnMany(result);
}

export async function getUserChainMap(): Promise<string[]> {
    let result = await pool.query("SELECT id, chainid   FROM users");  
    let map = <string[]>[];
    result.rows.forEach(r => map[r.id] = r.chainid);
    return map;    
}

export async function addRedeemRequest(data: RedeemRequest) { 
    let result = await pool.query("INSERT INTO public.request "
        + " (memberid, tokencount, regdate, requesttype, redeemforid, redeemcount)"
        + " VALUES($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)",
    [data.memberid, data.tokencount||0, 'redeem', data.redeemforid, data.redeemcount||0]);
    return true;
}

export async function completeRedeemRequest(requestid: number, iscomplete:boolean) {
    let result = await pool.query("UPDATE public.request "
        + " SET completedate = CURRENT_TIMESTAMP, iscomplete = $3"
        + " WHERE requesttype=$1 and id=$2",
        ['redeem', requestid, iscomplete]);
    return true;
}

export async function getRedeemRequestById(requestId: number): Promise<RedeemRequestItem> {
    let result = await pool.query("SELECT r.id, r.memberid, u.name as membername, r.redeemforid, rf.name as redeemforname, "
        + " r.redeemcount, r.tokencount, r.regdate, r.completedate, r.iscomplete "
        + " FROM request r "
        + " join users u on u.id = r.memberid "
        + " join list_redeemfor rf on rf.id = r.redeemforid "
        + " where r.requesttype = $1 and r.id=$2", ['redeem', requestId]);
    return returnSingle(result);
}

export async function getActiveRedeemRequestList(): Promise<RedeemRequestItem[]> {
    let result = await pool.query("SELECT r.id, r.memberid, u.name as membername, r.redeemforid, rf.name as redeemforname,"
        + " r.redeemcount, r.tokencount, r.regdate, r.completedate, r.iscomplete "
        + " FROM request r "
        + " join users u on u.id = r.memberid "
        + " join list_redeemfor rf on rf.id = r.redeemforid "
        + " where r.completedate is null and iscomplete is null and r.requesttype = $1", ['redeem']);
    return returnMany(result);
}

export async function addShareRequest(data: ShareRequest) {
    let result = await pool.query("INSERT INTO public.request "
        + " (memberid, tokencount, regdate,completedate, requesttype, sharetoid, iscomplete)"
        + " VALUES($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, true)",
        [data.memberid, data.tokencount || 0, 'share', data.sharetoid]);
    return true;
}

export async function updateTokenBalance(bal: BalanceItem) {
    let result = await pool.query("INSERT INTO tokens (  userid, eeareward, eeareputation, eeapenalty) "
   + " VALUES ($1, $2, $3, $4) ON CONFLICT(userid)"
        + " DO UPDATE set eeareward = $2, eeareputation = $3, eeapenalty = $4", [bal.userid, bal.EEAReward, bal.EEAReputation, bal.EEAPenalty]);
    return true;
}
 
export async function getReqestsListForMember(memberid: number): Promise<RequestListItem[]> { 
    let result = await pool.query("SELECT r.id, r.requesttype, r.tokencount, r.regdate, r.completedate, r.iscomplete "
        + " FROM request r "        
        //+ " join list_redeemfor rf on rf.id = r.redeemforid "
        + " where memberid = $1", [memberid]);
    return returnMany(result);
}