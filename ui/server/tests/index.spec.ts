import { app, server } from '../src/index';
import * as db from '../src/utils/database';
import * as ethTools from '../src/utils/eth-test-utils';
import { getEmployeeBallance, getMemberBallance, syncMemberBalance, syncEmployeeBalance} from '../src/utils/eth-workers';
import supertest from 'supertest';


const adminUser = { "login": "admin", "pwd": "adminPwd" };
const member1 = { "login": "member1@test.com", "pwd": "pwd" };
const member1RegRequest = { "name": "Test First Org", "email": member1.login, "password": member1.pwd };

const member2 = { "login": "member2@test.com", "pwd": "pwd" };
const member2RegRequest = { "name": "Test Second Org", "email": member2.login, "password": member2.pwd };

const employee1 = { "login": "employee1@test.com", "pwd": "pwd" };
const employee1RegRequest = { "name": "Org1 Employee", "email": employee1.login, "password": employee1.pwd };

const employee2 = { "login": "employee2@test.com", "pwd": "pwd" };
const employee2RegRequest = { "name": "Org2 Employee", "email": employee2.login, "password": employee2.pwd };

function randomString() { 
  return Math.random().toString(36).substring(2, 15);
}

let tokenAdmin = '';
let tokenMember1 = '';
let tokenMember2 = '';
let tokenEmployee1 = '';
let tokenEmployee2 = '';

process.env.DISABLE_CHAIN_SYNC = "true";

async function cleanUp() { 
  await db.deleteUserByLogin(member1.login);
  await db.deleteUserByLogin(member2.login);
  await db.deleteUserByLogin(employee1.login);
  await db.deleteUserByLogin(employee2.login);
}

let request: supertest.SuperTest<supertest.Test>;

beforeAll(async (done) => { 
  jest.setTimeout(10000);
  await cleanUp();
  done();
});

beforeEach(() => {
  request = supertest(app);
  jest.setTimeout(10000);
});

afterAll(async (done) => {
  await cleanUp();
  server.close(done);
});

async function loginAdmin(done) {
  let res = await request.post('/api/login')
    .send(adminUser)
    .expect(200);

  tokenAdmin = res.header['x-auth-token'];
  expect(tokenAdmin).not.toBeUndefined();
  expect(tokenAdmin).not.toBeNull();

  done();
}
 
async function loginMember1(done) {
  let res = await request.post('/api/login')
    .send(member1)
    .expect(200);
  tokenMember1 = res.header['x-auth-token'];
  expect(tokenMember1).not.toBeUndefined();
  expect(tokenMember1).not.toBeNull();

  done();
}

async function loginMember2(done) {
  let res = await request.post('/api/login')
    .send(member2)
    .expect(200);
  tokenMember2 = res.header['x-auth-token'];
  expect(tokenMember2).not.toBeUndefined();
  expect(tokenMember2).not.toBeNull();

  done();
}

async function loginEmployee1(done) {
  let res = await request.post('/api/login')
    .send(employee1)
    .expect(200);
  tokenEmployee1 = res.header['x-auth-token'];
  expect(tokenMember1).not.toBeUndefined();
  expect(tokenMember1).not.toBeNull();

  done();
}

async function loginEmployee2(done) {
  let res = await request.post('/api/login')
    .send(employee2)
    .expect(200);
  tokenEmployee2 = res.header['x-auth-token'];
  expect(tokenMember1).not.toBeUndefined();
  expect(tokenMember1).not.toBeNull();

  done();
}


describe('members registration', () => {

  it('should login as admin ', loginAdmin);

  it('should register new first member', async (done) => {
    let res = await request.post('/api/admin/registermember')
      .set('Authorization', 'Bearer ' + tokenAdmin)
      .send(member1RegRequest)
      .expect(200);
    done();
  });

  it('should reject register new member with existing email', async (done) => {
    let res = await request.post('/api/admin/registermember')
      .set('Authorization', 'Bearer ' + tokenAdmin)
      .send(member1RegRequest)
      .expect(400);
    expect(res.text).toEqual("User with email \"" + member1.login + "\" already registered");
    done();
  });

  it('should register new second member', async (done) => {
    let res = await request.post('/api/admin/registermember')
      .set('Authorization', 'Bearer ' + tokenAdmin)
      .send(member2RegRequest)
      .expect(200);
    done();
  });

  it('should display first member on member list', async (done) => {
    let res = await request.get('/api/member/members')
      .set('Authorization', 'Bearer ' + tokenAdmin)
      .expect(200);
    const members = JSON.parse(res.text).filter(m => m.email == member1.login);
    expect(members.length).toEqual(1);
    expect(members[0].name).toEqual(member1RegRequest.name);
    done();
  });

  it('should display second member on member list', async (done) => {
    let res = await request.get('/api/member/members')
      .set('Authorization', 'Bearer ' + tokenAdmin)
      .expect(200);
    const members = JSON.parse(res.text).filter(m => m.email == member2.login);
    expect(members.length).toEqual(1);
    expect(members[0].name).toEqual(member2RegRequest.name);
    done();
  });

  it('should login as first member', loginMember1);

  it('should login as second member', loginMember2);

});

describe('first member eployee registration', () => {
  it('should login as first member', loginMember1);

  it('should have access to balance page', async (done) => {
    let res = await request.get('/api/member/balance')
      .set('Authorization', 'Bearer ' + tokenMember1)
      .expect(200);    
    done();
  });

  it('should register new employee', async (done) => {
    let res = await request.post('/api/member/registeremployee')
      .set('Authorization', 'Bearer ' + tokenMember1)
      .send(employee1RegRequest)
      .expect(200);
    
    done();
  });

  it('should reject register new employee with existing email', async (done) => {
    let res = await request.post('/api/member/registeremployee')
      .set('Authorization', 'Bearer ' + tokenMember1)
      .send(employee1RegRequest)
      .expect(400);
    expect(res.text).toEqual("User with email \"" + employee1.login + "\" already registered");
    done();
  });

  it('should display employee on employee list', async (done) => {
    let res = await request.get('/api/member/employees')
      .set('Authorization', 'Bearer ' + tokenMember1)
      .expect(200);
    const members = JSON.parse(res.text).filter(m => m.email == employee1.login);
    expect(members.length).toEqual(1);
    expect(members[0].name).toEqual(employee1RegRequest.name);
    done();
  });

  it('should login as registered employee', loginEmployee1);

});
  

describe('second member eployee registration', () => {
  it('should login as second member', loginMember2);

  it('should have access to balance page', async (done) => {
    let res = await request.get('/api/member/balance')
      .set('Authorization', 'Bearer ' + tokenMember2)
      .expect(200);
    done();
  });

  it('should register new employee', async (done) => {
    let res = await request.post('/api/member/registeremployee')
      .set('Authorization', 'Bearer ' + tokenMember2)
      .send(employee2RegRequest)
      .expect(200);

    done();
  });

  it('should reject register new employee with existing email', async (done) => {
    let res = await request.post('/api/member/registeremployee')
      .set('Authorization', 'Bearer ' + tokenMember2)
      .send(employee2RegRequest)
      .expect(400);
    expect(res.text).toEqual("User with email \"" + employee2.login + "\" already registered");
    done();
  });

  it('should display employee on employee list', async (done) => {
    let res = await request.get('/api/member/employees')
      .set('Authorization', 'Bearer ' + tokenMember2)
      .expect(200);
    const members = JSON.parse(res.text).filter(m => m.email == employee2.login);
    expect(members.length).toEqual(1);
    expect(members[0].name).toEqual(employee2RegRequest.name);
    done();
  });

  it('should login as registered employee', loginEmployee2);

});

describe('Tokens flows', () => { 
  let member1user, member2user, employee1user, employee2user;
  const tokenToMint = 100;


  beforeAll(async (done) => {
    jest.setTimeout(10000);
    member1user = await db.getUserByLogin(member1.login);
    member2user = await db.getUserByLogin(member2.login);
    employee1user = await db.getUserByLogin(employee1.login);
    employee2user = await db.getUserByLogin(employee2.login);
    done();
  });

  it('should admin issue EEA Tokens to employees', async (done) => {
    jest.setTimeout(30000);
    const member1BalanceBefore = await getMemberBallance(member1user.chainid);
    //TEE service call reaplced by test token issue
    await ethTools.MintTokens(employee1.login, tokenToMint);
    await ethTools.MintTokens(employee2.login, 2*tokenToMint);

    const member1Balance = await getMemberBallance(member1user.chainid);
    const member2Balance = await getMemberBallance(member2user.chainid);
    const employee1Balance = await getMemberBallance(employee1user.chainid);
    const employee2Balance = await getMemberBallance(employee2user.chainid);

    await syncMemberBalance(member1user.id);
    await syncMemberBalance(member2user.id);
    await syncEmployeeBalance(employee1user.id);
    await syncEmployeeBalance(employee2user.id)

    expect(member1Balance.EEAReward).toEqual(tokenToMint);
    expect(member1Balance.EEAReputation).toEqual(tokenToMint);    
    expect(employee1Balance.EEAReputation).toEqual(tokenToMint);

    expect(member2Balance.EEAReward).toEqual(2*tokenToMint);
    expect(member2Balance.EEAReputation).toEqual(2*tokenToMint);
    expect(employee2Balance.EEAReputation).toEqual(2*tokenToMint);

    done();
  });

  describe('Admin pages', () => {
    it('should admin view EEA Reputation on Member Orgs page', async (done) => {
      let res = await request.get('/api/member/members')
        .set('Authorization', 'Bearer ' + tokenAdmin)
        .expect(200);
      const members = JSON.parse(res.text);
      const member1row = members.filter(m => m.email == member1.login);
      const member2row = members.filter(m => m.email == member2.login);
    
      expect(member1row.length).toEqual(1);
      expect(member1row[0].EEAReputation).toEqual(tokenToMint);
    
      expect(member2row.length).toEqual(1);
      expect(member2row[0].EEAReputation).toEqual(2 * tokenToMint);
    
      done();
    });

    it('should admin view EEA Reputation on Employees page', async (done) => {
      let res = await request.get('/api/member/employees')
        .set('Authorization', 'Bearer ' + tokenAdmin)
        .expect(200);
      const employees = JSON.parse(res.text);
      const employee1row = employees.filter(m => m.email == employee1.login);
      const employee2row = employees.filter(m => m.email == employee2.login);

      expect(employee1row.length).toEqual(1);
      expect(employee1row[0].EEAReputation).toEqual(tokenToMint);

      expect(employee2row.length).toEqual(1);
      expect(employee2row[0].EEAReputation).toEqual(2 * tokenToMint);

      done();
    });
  });

  describe('Member pages', () => {
    it('should member view EEA Reputation on Member Orgs page', async (done) => {
      let res = await request.get('/api/member/members')
        .set('Authorization', 'Bearer ' + tokenMember1)
        .expect(200);
      const members = JSON.parse(res.text);
      const member1row = members.filter(m => m.email == member1.login);
      const member2row = members.filter(m => m.email == member2.login);

      expect(member1row.length).toEqual(1);
      expect(member1row[0].EEAReputation).toEqual(tokenToMint);

      expect(member2row.length).toEqual(1);
      expect(member2row[0].EEAReputation).toEqual(2 * tokenToMint);

      done();
    });

    it('should member view EEA Reputation on Employees page', async (done) => {
      let res = await request.get('/api/member/employees')
        .set('Authorization', 'Bearer ' + tokenMember1)
        .expect(200);
      const employees = JSON.parse(res.text);
      const employee1row = employees.filter(m => m.email == employee1.login);
      const employee2row = employees.filter(m => m.email == employee2.login);

      expect(employee1row.length).toEqual(1);
      expect(employee1row[0].EEAReputation).toEqual(tokenToMint);

      expect(employee2row.length).toEqual(1);
      expect(employee2row[0].EEAReputation).toEqual(2 * tokenToMint);

      done();
    });

    it('should member view own EEA Reputation and EEA Tokens on EEA Token Overview page', async (done) => {
      let res = await request.get('/api/member/balance')
        .set('Authorization', 'Bearer ' + tokenMember1)
        .expect(200);
      const balance = JSON.parse(res.text);

      expect(balance.EEAReputation).toEqual(tokenToMint);
      expect(balance.EEAReward).toEqual(tokenToMint);

      done();
    });
  });

  describe('Employee pages', () => {
    it('should employee view EEA Reputation on Member Orgs page', async (done) => {
      let res = await request.get('/api/member/members')
        .set('Authorization', 'Bearer ' + tokenEmployee1)
        .expect(200);
      const members = JSON.parse(res.text);
      const member1row = members.filter(m => m.email == member1.login);
      const member2row = members.filter(m => m.email == member2.login);

      expect(member1row.length).toEqual(1);
      expect(member1row[0].EEAReputation).toEqual(tokenToMint);

      expect(member2row.length).toEqual(1);
      expect(member2row[0].EEAReputation).toEqual(2 * tokenToMint);

      done();
    });

    it('should employee view EEA Reputation on Employees page', async (done) => {
      let res = await request.get('/api/member/employees')
        .set('Authorization', 'Bearer ' + tokenEmployee1)
        .expect(200);
      const employees = JSON.parse(res.text);
      const employee1row = employees.filter(m => m.email == employee1.login);
      const employee2row = employees.filter(m => m.email == employee2.login);

      expect(employee1row.length).toEqual(1);
      expect(employee1row[0].EEAReputation).toEqual(tokenToMint);

      expect(employee2row.length).toEqual(1);
      expect(employee2row[0].EEAReputation).toEqual(2 * tokenToMint);

      done();
    });

    it('should employee view own EEA Reputation on EEA Token Overview page', async (done) => {
      let res = await request.get('/api/employee/balance')
        .set('Authorization', 'Bearer ' + tokenEmployee1)
        .expect(200);
      const balance = JSON.parse(res.text);

      expect(balance.EEAReputation).toEqual(tokenToMint);     

      done();
    });
  });

  describe('EEA Token share', () => {
    const shareCount = 150;    
    it('should second member share EEA token to first member', async (done) => {
      jest.setTimeout(20000);
      const member1BalanceBefore = await getMemberBallance(member1user.chainid);
      const member2BalanceBefore = await getMemberBallance(member2user.chainid);

      let res = await request.post('/api/member/share')
        .set('Authorization', 'Bearer ' + tokenMember2)
        .send({
          "sharetoid": member1user.id,
          "tokencount": 150
        })
        .expect(200);
      
      const member1BalanceAfter = await getMemberBallance(member1user.chainid);
      const member2BalanceAfter = await getMemberBallance(member2user.chainid);

      expect(member1BalanceAfter.EEAReward).toEqual(member1BalanceBefore.EEAReward + shareCount);
      expect(member2BalanceAfter.EEAReward).toEqual(member2BalanceBefore.EEAReward - shareCount);
      done();
    });

    it('should second member view EEA Token share request on Requests page', async (done) => {
      let res = await request.get('/api/member/requests')
        .set('Authorization', 'Bearer ' + tokenMember2)
        .expect(200);
      const requests = JSON.parse(res.text).filter(m => m.type == 'EEA Token Share');
      expect(requests.length).toEqual(1);
      expect(requests[0].status).toEqual('Completed');
      done();
    });
  });
  
  describe('EEA Token redeem', () => { 
    const redeemForId = 1;
    const redeemCount = 1;

   

    describe('EEA Token redeem reject', () => {
      let redeemRequestId = null;
      it('should first member create EEA Token redeem request', async (done) => {
        jest.setTimeout(20000);
        
        let res = await request.post('/api/member/redeem')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .send({
            "redeemforid": redeemForId,
            "redeemforcount": redeemCount
          })
          .expect(200);
        done();
      });
      it('should first member view created EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/member/requests')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.type == 'EEA Token Redemption' && m.status == 'Pending');        
        
        expect(requests.length).toEqual(1);        
        redeemRequestId = requests[0].id;
        done();
      });
      it('should admin view created EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/admin/requests')
          .set('Authorization', 'Bearer ' + tokenAdmin)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.id == redeemRequestId);
        expect(requests.length).toEqual(1);
        done();
      });
      it('should admin reject EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);
        
        let res = await request.post('/api/admin/processredeem')
          .set('Authorization', 'Bearer ' + tokenAdmin)
          .send({ "requestid": redeemRequestId, "iscomplete": false })
          .expect(200);
       
        done();
      });
      it('should member view created EEA Token redeem request as Rejected on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/member/requests')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.id ==redeemRequestId);
        expect(requests.length).toEqual(1);
        expect(requests[0].status).toEqual('Rejected');        
        done();
      });
    });

    describe('EEA Token redeem complete', () => {
      let redeemRequestId = null;
      it('should first member create EEA Token redeem request', async (done) => {
        jest.setTimeout(20000);

        let res = await request.post('/api/member/redeem')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .send({
            "redeemforid": redeemForId,
            "redeemforcount": redeemCount
          })
          .expect(200);
        done();
      });
      it('should first member view created EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/member/requests')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.type == 'EEA Token Redemption' && m.status == 'Pending');
        expect(requests.length).toEqual(1);
        redeemRequestId = requests[0].id;
        done();
      });
      it('should admin view created EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/admin/requests')
          .set('Authorization', 'Bearer ' + tokenAdmin)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.id == redeemRequestId);
        expect(requests.length).toEqual(1);
        done();
      });
      it('should admin complete EEA Token redeem request on Requests page', async (done) => {
        jest.setTimeout(20000);

        const member1BalanceBefore = await getMemberBallance(member1user.chainid);

        let res = await request.post('/api/admin/processredeem')
          .set('Authorization', 'Bearer ' + tokenAdmin)
          .send({ "requestid": redeemRequestId, "iscomplete": true })
          .expect(200);       
        
        const member1BalanceAfter = await getMemberBallance(member1user.chainid);
        expect(member1BalanceAfter.EEAReward).toBeLessThan(member1BalanceBefore.EEAReward);

        done();
      });
      it('should member view created EEA Token redeem request as Completed on Requests page', async (done) => {
        jest.setTimeout(20000);

        let res = await request.get('/api/member/requests')
          .set('Authorization', 'Bearer ' + tokenMember1)
          .expect(200);
        const requests = JSON.parse(res.text).filter(m => m.id == redeemRequestId);
        expect(requests.length).toEqual(1);
        expect(requests[0].status).toEqual('Completed');
        done();
      });
    });
  });
});
  




