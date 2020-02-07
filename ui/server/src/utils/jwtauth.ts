import jwt from 'jsonwebtoken'; 
import { Request, Response, NextFunction } from 'express';

let privateKey = process.env.JWT_KEY;

export function generateAuthToken(data: Object):string {
    const token = jwt.sign(data, privateKey); 
    let verify = jwt.verify(token, privateKey);
    return token;
}

function processAuth(req: Request, res: Response, next: NextFunction, role?:string) { 
    //get the token from the header if present
    let token = req.headers["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).send("Access denied. No token provided.");

    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded:any = jwt.verify(token, privateKey);
        res.locals.user = decoded; 
        if (!role || role == decoded.role)
            next();
        else
            res.status(401).end();
    } catch (ex) {
        console.log(ex);
        console.log(token);
        //if invalid token
        res.status(400).send("Invalid token.");
    }
};

export function AnyLogged(req: Request, res: Response, next: NextFunction) {
    processAuth(req, res, next);
};

export function Admin(req: Request, res: Response, next: NextFunction) {
    processAuth(req, res, next, 'admin');
};

export function Member(req: Request, res: Response, next: NextFunction) {
    processAuth(req, res, next, 'member');
};

export function Employee(req: Request, res: Response, next: NextFunction) {
    processAuth(req, res, next, 'employee');
};