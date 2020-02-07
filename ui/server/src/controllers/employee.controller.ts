import { Request, Response } from 'express';
import { getCurrentUser } from '../utils/user';
import { syncEmployeeBalance } from '../utils/eth-workers'



export async function getBalance(req: Request, res: Response) {
    const currUser = await getCurrentUser(res);
    if (!currUser) {
        res.status(401).send('Unknown member'); return;
    }

    const balance = await syncEmployeeBalance(currUser.id);

    const result = {        
        EEAReputation: balance.EEAReputation
    };
    res.send(result); 
    
}
  


