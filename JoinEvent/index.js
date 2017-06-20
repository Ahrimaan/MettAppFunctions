var tokenCheck = require('../checkToken');
var userService = require('../userService');

module.exports = function (context, req,doc) {
    context.log('Token: ' + req.headers.token);
    let userToken = tokenCheck(req.headers.token, context)
    if (userToken) {
        userService.getUserInformation(userToken.sub, (err, result) => {
            if (err) {
                context.res = {
                    status: 500,
                    body: err
                };
                context.done();
            }
            let participantData = {
                userId: result.user_id,
                userName: result.name,
                value: req.body.value,
                specialNeeds: req.body.special,
                payed: req.body.payed
            }
            if (doc.filter(x => x.id === req.body.eventId).length <= 0) {
                context.res = {
                    status: 404
                };
                context.done();
            }
            let index = doc.findIndex(x => x.id === req.body.eventId);
            context.bindings.event = doc;
            context.bindings.event[index].participants.push(participantData);
            context.res = {
                body: context.bindings.event[index]
            };
            context.done();
        })
    }
    else {
        context.res = {
            status: 401,
            body: 'token was wrong expired or missing'
        };
        context.done();
    }
};

function filterEvents(eventA, eventB) {
    let aDate = new Date(eventA.eventDate).getTime();
    let bDate = new Date(eventB.eventDate).getTime();
    if (aDate < bDate) {
        return -1;
    }
    if (aDate > bDate) {
        return 1;
    }

    return 0;
}

function GetDocuments(doc) {
    let filteredItems = doc.filter(item => new Date(item.eventDate).getTime() >= new Date().getTime())
        .sort(filterEvents)
        .map(i => {
            return {
                eventDate: i.eventDate,
                id: i.id,
                createdBy: i.createdBy,
                createDate: i.createDate,
                participants: i.participants
            }
        });

    return filteredItems;
}