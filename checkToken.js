var jwt = require('jsonwebtoken');

module.exports = function(token,context){
    try{
        let secret =  new Buffer(process.env.tokenSecret, "base64")
        let decoded = jwt.verify(token,secret,{ ignoreExpiration:false});
        return decoded;
    }catch (err) {
        context.log(err);
    }
    return undefined;
}