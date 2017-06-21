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
