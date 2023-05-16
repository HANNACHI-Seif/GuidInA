import { Request, Response } from "express";
import { createForm, createSpecialUserProfile, deleteApplication, fetchApplication } from "../middleware/roleApplication.middleware";
import Application_Form from "../entities/application_form";
import roles from "../constants/roles";
import Languages from "../constants/languages";
import errors from "../constants/errors";
import appDataSource from "../ormconfig"
import Role from "../entities/role";



let createApplicationForm = async( req:Request, res: Response) => {
    try{
        let { firstName, lastName, city, phoneNumber, role, languages }:
            {firstName: string, lastName: string, city: string, phoneNumber: string, role: string, languages:string[]} = req.body
        let isValidRole = Object.values(roles).includes(role as roles)
        let isValidLanguages = languages.every((language) =>{
            return Object.values(Languages).includes(language as Languages) 
        });
        if (!isValidRole || !isValidLanguages) {
            throw new Error("Invalid input")
        } else {
            //req.file.path
            let newForm = await createForm( req.file?.path!,firstName, lastName, city, phoneNumber, (role as roles) , (languages as Languages[]), req.user!)
            if (!(newForm instanceof Application_Form)) {
                res.json({ errors: newForm })
            } else {
                res.json({ msg: "Applied successfuly", form: newForm })
            }
        }
    } catch (error){
        if (error.code == "ER_DUP_ENTRY" ) {
            res.json({ msg: "You have already applied. Please wait for a response before applying again." })
        } else {
            res.json({ msg: "Unexpected error occured, could not apply" })
        }
   }

}


let adminAcceptApplication = async(req:Request, res: Response) => {
    try {
        let application = await fetchApplication(req.params.id)
        if (!application) throw new Error(errors.RESOURCE_NOT_FOUND)
        await createSpecialUserProfile(application!)
        await deleteApplication(application)
        res.json({msg: "Application accepted"})
    } catch (error) {
        console.log(error)
        res.json({ error: error.message })
    }

 
}

let adminDeclineApplication = async (req: Request, res: Response) => {
    try {
        let application = await fetchApplication(req.params.id)
        if (!application) throw new Error(errors.RESOURCE_NOT_FOUND)
        await deleteApplication(application)
        res.json({ msg: "Application denied" })
    } catch (error) {
        console.log(error)
        res.json({ error: error.message })
    }
}

let fetchAllAppplications = async (req: Request, res: Response) => {
    try {
        let applications = await appDataSource.getRepository(Application_Form).find({ relations: { languages: true, role: true } })
        res.json({ applications })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not fetch applications" })
    }
}


export {
    createApplicationForm,
    adminAcceptApplication,
    adminDeclineApplication,
    fetchAllAppplications

}