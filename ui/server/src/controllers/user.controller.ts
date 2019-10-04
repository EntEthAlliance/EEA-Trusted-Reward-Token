import { Request, Response } from 'express';
import { generateAuthToken } from '../utils/jwtauth';
import { getUserByLogin } from '../utils/database';
import { syncBalances } from '../utils/eth-workers'
import { Keccak } from 'sha3';

export async function login(req: Request, res: Response) {
  
  if (!req.body.login || !req.body.pwd) {
    res.status(401).send('Incorrect login or password');
    return;
  }
  let login = req.body.login;
  let pwd = req.body.pwd;

  let dbUser = await getUserByLogin(login);

  if (dbUser == null) { 
    res.status(401).send('Incorrect login or password');
    return;
  }
  
  let pwdhash = new Keccak(256).update(pwd).update(dbUser.salt).digest('hex');
  
  if (pwdhash != dbUser.pwdhash) { 
    res.status(401).send('Incorrect login or password'); 
    return;
  }

  let user = {
    name: dbUser.name,
    _id: dbUser.id,
    role: dbUser.role
  };

  const token = generateAuthToken(user);
  
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    role: user.role
  });

  //Run background sync with chain
  syncBalances();

}


