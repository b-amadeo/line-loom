const bcrypt = require('bcryptjs')

function hash(password){
    const salt = bcrypt.genSaltSync(10)
    const hashedpassword = bcrypt.hashSync(password, salt)
    return hashedpassword
}

function compare(password, hashedpassword){
    const result =bcrypt.compareSync(password, hashedpassword)
    return result
}

module.exports = { hash, compare }