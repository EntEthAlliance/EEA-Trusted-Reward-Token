import request from 'request-promise-native';
import * as db from '../utils/database';
let teeEndpoint = process.env.TEE_ENDPOINT;
console.log('TEE_ENDPOINT', teeEndpoint);

export interface IssueTokenRequest {
    members: MemberTokenRequest[]
}

export interface MemberTokenRequest {
    id: number
    employees: EmployeeTokenRequest[]
}

export interface EmployeeTokenRequest {
    id: number,
    reasonid: number,
    success: true
}

export async function SendTokenIssueRequest(data: IssueTokenRequest):Promise<any> {
    const userMap = await db.getUserChainMap();   
    let mapped = data.members.map(function (m) {        
        return <any>{
            organization_ID: 'did:ethr:' + userMap[m.id].substring(2).toLowerCase(), //Cut 0x
            token_request: m.employees.map(e => <any>{
                account: 'did:ethr:' + (userMap[e.id] || '').substring(2).toLowerCase(), //Cut 0x
                type: e.reasonid,
                success: e.success
            })
        };
    });

    let body = 'issue_burn_tokens[]:' + JSON.stringify(mapped);
    console.debug('TEE', body);
    let res = await request.post(teeEndpoint, { body: body, headers: { 'Content-Type': 'application/text' } });
    return res;
 }


