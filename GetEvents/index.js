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

function filterEvents(eventA,eventB){
    let aDate = new Date(eventA.eventDate).getTime();
    let bDate = new Date(eventB.eventDate).getTime();
    if(aDate < bDate)
    {
        return -1;
    }
    if(aDate > bDate){
        return 1;
    }

    return 0;
}

function GetDocuments(doc) {
    let filteredItems = doc.filter(item => new Date(item.eventDate).getTime() >= new Date().getTime())
    .sort(filterEvents)    
    .map(i => {
        return {
            eventDate:i.eventDate,
            id:i._self,
            createdBy:i.createdBy,
            createDate:i.createDate,
            participants:i.participants
        }
     });

    return filteredItems;
}