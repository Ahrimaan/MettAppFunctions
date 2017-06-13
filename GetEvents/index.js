var tokenCheck = require('../checkToken');

module.exports = function (context, req, doc) {
    context.log('Token: ' + req.headers.token);
    if (tokenCheck(req.headers.token, context)) {
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
    let filteredItems = doc.filter(item => new Date(item.eventDate).getTime() >= new Date().getTime()).map(i => {
        return {
            eventDate:i.eventDate,
            id:i.id,
            createdBy:i.createdBy,
            createDate:i.createDate,
            participants:i.participants
        }
     });

    return filteredItems;
}