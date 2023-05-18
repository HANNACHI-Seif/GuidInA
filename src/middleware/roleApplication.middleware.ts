import Application_Form from "../entities/application_form"
import appDataSource from "../ormconfig"
import roles from "../constants/roles"
import Role from "../entities/role"
import Language from "../entities/language"
import { validate } from "class-validator"
import { errors_type } from "./user.middleware"
import Languages from "../constants/languages"
import User from "../entities/user"
import Special_User_Profile from "../entities/special_user_profile"
import fs from "fs"



let createForm =  async (url:string, firstName: string, lastName:string, city:string, phoneNumber: string, role: roles, languages: Languages[], user: User) => {
    let newForm = new Application_Form()
        newForm.firstName = firstName
        newForm.lastName = lastName
        newForm.city = city
        newForm.phoneNumber = phoneNumber 
        newForm.cv_file_url = url
        newForm.languages = []
        newForm.user = user
        //validation:
        const error_response: errors_type[] =[]
        if (role == roles.ADMIN || role == roles.TOURIST) {
            error_response.push({ field: "role", errors: ['please choose a valid service'] })
        }
        const errors = await validate(newForm)
        for (const error of errors) {
            const field = error.property
            const error_messages = Object.values(error.constraints!)
            error_response.push({field: field, errors: error_messages})
        }
        if (error_response.length > 0) {
            return error_response;
        }
        //establishing relations
        let result = await appDataSource.manager.insert(Application_Form, newForm)
        let formID: string = result.identifiers[0].id
        let saved_form = await appDataSource.getRepository(Application_Form).findOne({ where: { id: formID }, relations: { languages: true, role: true } })
        let language_repo = appDataSource.getRepository(Language)
        saved_form!.languages = []
        for (let i of languages) {
            let db_lang = await language_repo.findOne({ where: { name: i } })
            saved_form!.languages.push(db_lang!)
        }
        let db_role = await appDataSource.getRepository(Role).findOne({ where: { roleName: role } })
        saved_form!.role = db_role!
        return await appDataSource.manager.save(saved_form)
}


let createSpecialUserProfile = async (application: Application_Form) => {
    let new_special_user_profile = new Special_User_Profile()
    new_special_user_profile.bio = ""
    new_special_user_profile.city = application?.city!
    new_special_user_profile.firstName = application?.firstName!
    new_special_user_profile.languages = application?.languages!
    new_special_user_profile.lastName = application?.lastName!
    new_special_user_profile.phonenumber = application?.phoneNumber!
    new_special_user_profile.user = application.user!
    let result = await appDataSource.manager.save(new_special_user_profile)
    let user = await appDataSource.manager.getRepository(User).findOne({ where: { id: application.user.id }, relations: { roles: true } })
    let db_role = await appDataSource.manager.getRepository(Role).findOne({ where: { id: application.role.id } })
    user?.roles.push(db_role!)
    user!.profile = result
    await appDataSource.manager.save(user)

}

let deleteApplication = async (application: Application_Form) => {
    if (fs.existsSync(application.cv_file_url)) {
        fs.unlinkSync(application.cv_file_url)
    }
    await appDataSource.getRepository(Application_Form).delete({ id: application.id })
}

let fetchApplication = async (id: string) => {
    let result =  await appDataSource.getRepository(Application_Form).findOne({ where: { id: id }, relations: { user: true, languages: true, role: true } })
    return result
}

export { 
    createForm,
    createSpecialUserProfile,
    deleteApplication,
    fetchApplication
 }