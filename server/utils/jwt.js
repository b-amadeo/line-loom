const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY

function signToken(payload){
    const signToken = jwt.sign(payload, secretKey)
    return signToken
}

function verifyToken(token){
    const verifyToken = jwt.verify(token, secretKey)
    return verifyToken
}

module.exports = { signToken, verifyToken }