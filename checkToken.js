var jwt = require('jwt-simple');

module.exports = function(token,context){
    if(process.env.debug === "true"){
        return true;
    }
    try{
        var token = jwt.decode(token, process.env.auth0secret, false, 'HS256');
        return token !== undefined;
    }catch (err) {
        context.log(err);
    }
    return false;
}