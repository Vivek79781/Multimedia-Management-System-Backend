const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../utils/config') 

module.exports = function (req,res,next) {
    const token = req.header('jwt-token');

    if(!token) {
        return res.status(401).json({ msg:"No Token / Authorization Denied"})
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.user = decoded.user
        next()
    } catch (err) {
        res.status(401).json({msg:"Token is not valid"})
    }
};