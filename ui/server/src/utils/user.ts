import { Request, Response } from 'express';
import * as db from '../utils/database';

export async function getCurrentUser(res: Response):Promise<db.User> { 
    const currUser = res.locals.user;
    if(!currUser) return null;
    const dbUser = await db.getUserById(currUser._id);
    if (!dbUser) return null;
    return dbUser;     
}