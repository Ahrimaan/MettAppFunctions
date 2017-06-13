var tokenCheck = require('../checkToken');
var userService = require('../userService');

module.exports = function (context, req, doc) {
    context.log('Token :' + req.headers.token);
    if (tokenCheck(req.headers.token, context)) {
        if (allInformationProvided(req.body)) {
            userService.getAllUsers(function (err, data) {
                if (err) {
                    context.res = {
                        status: 500,
                        body: JSON.stringify(err)
                    };
                    context.done();
                    return;
                }
                let users = JSON.parse(data);
                let user = users.filter(x => x.user_id === req.body.userid)[0];
                let newEvent = {
                    eventDate: new Date(req.body.eventDate),
                    createDate: new Date(),
                    createdBy: user.name,
                    participants: []
                }

                if (isEventAvailable(doc, newEvent.eventDate)) {
                    context.bindings.event = newEvent;
                    context.res = {
                        body: context.bindings.event
                    }
                    context.done();
                } else {
                    context.res = {
                        status: 409,
                        body: {
                            'message': 'there is already an event with that date'
                        }
                    }
                    context.done();
                }
            });

        }
        else {
            context.res = {
                status: 400,
                body: {
                    message: ' not all fields are filled '
                }
            };
            context.done();
        }
    }
    else {
        context.res = {
            status: 401
        }
        context.done();
    }
}

function allInformationProvided(newEvent) {
    return newEvent !== undefined && newEvent.eventDate !== undefined;
}

function isEventAvailable(doc, eventDate, result) {
    let filtered = doc.filter(item => new Date(item.eventDate).getDate() === eventDate.getDate());
    return filtered.length < 1;
}