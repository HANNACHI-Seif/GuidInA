import { NextFunction, Request, Response } from 'express'
import roles from '../constants/roles'




let adminCheck = (req: Request, res: Response, next: NextFunction) => {
    let isAdmin = req.user?.roles.some(role => role.roleName == roles.ADMIN)
    if ( !isAdmin ) res.json({ msg: "unauthorized" })
    else next()
}

export {
    adminCheck
}