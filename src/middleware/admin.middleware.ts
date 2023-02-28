import { NextFunction, Request, Response } from 'express'
import roles from '../constants/roles'




let adminCheck = (req: Request, res: Response, next: NextFunction) => {
    if ( req.user?.role !== roles.ADMIN ) res.json({ msg: "unauthorized" })
    else next()
}

export {
    adminCheck
}