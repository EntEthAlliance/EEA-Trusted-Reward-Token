import express, { Request, Response } from 'express';

import * as testController from './controllers/test.controller';
import * as adminController from './controllers/admin.controller';
import * as memberController from './controllers/member.controller';
import * as employeeController from './controllers/employee.controller';
import * as userController from './controllers/user.controller';

import * as auth from './utils/jwtauth';

const router = express.Router();

router.get('/status', testController.getStatus);

router.get('/test/mint', testController.mintRewards);
router.get('/test/reregister', testController.reRegisterUsers);

router.post('/login', userController.login);

//Admin
router.get('/admin/requests', auth.Admin, adminController.getRequestsList);
router.get('/admin/requests/:requestid', auth.Admin, adminController.getRequest);
router.get('/admin/rewardreasons', auth.Admin, adminController.getRewardReasons);

router.post('/admin/processredeem', auth.Admin, adminController.processRedeem);
router.post('/admin/issuetokens', auth.Admin, adminController.issueTokens);
router.post('/admin/registermember', auth.Admin, adminController.registerMember);


//Member
router.get('/member/:member/employees', auth.AnyLogged, memberController.getEmployeesList);
router.get('/member/employees', auth.AnyLogged, memberController.getAllEmployeesList);
router.get('/member/members', auth.AnyLogged, memberController.getMembersList);
router.get('/member/requests', auth.Member, memberController.getRequestsList);
router.get('/member/balance', auth.Member, memberController.getBalance);
router.get('/member/list/redeemfor', auth.Member, memberController.getRedeemForList);

router.post('/member/redeem', auth.Member, memberController.reedemToken);
router.post('/member/share', auth.Member, memberController.shareToken);
router.post('/member/registeremployee', auth.Member, memberController.registerEmployee);

//Employee
router.get('/employee/balance', auth.Employee, employeeController.getBalance);

export { router };
