import bcrypt from "bcrypt"

let generateHash = async(passwd: string) => {
    let salt = await bcrypt.genSalt()//hash
    return bcrypt.hash(passwd, salt)
}

export {
    generateHash
}