var tokenCheck = require('../checkToken');

module.exports = function (context, req, doc) {
    context.log('Token: ' + req.headers.token);
    context.log('Secret: ' + process.env.auth0secret);
    let isDebug = process.env.debug === "true";
    if (isDebug || tokenCheck(req.headers.token, context)) {
        context.res = {
            status: 200,
            body: GetDocuments(doc)
        };
    }
    else {
        context.res = {
            status: 401,
            body: 'token was wrong expired or missing'
        };
    }
    context.done();
};

function GetDocuments(doc) {
    return doc.filter(item => new Date(item.EventDate).getTime() >= new Date().getTime());
}