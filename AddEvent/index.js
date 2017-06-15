var tokenCheck = require('../checkToken');
var userService = require('../userService');

module.exports = function (context, req, doc) {
    context.log('Token :' + req.headers.token);
    let token = tokenCheck(req.headers.token, context);
    if (token) {
        if (allInformationProvided(req.body)) {
            let newEventDate = new Date(req.body.eventDate);
            if (isEventAvailable(doc, newEventDate)) {
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
                    let user = process.env.debug === 'true' ? { app_metadata: { isAdmin:'true' }, name:'TESTNAME'} : users.filter(x => x.user_id === token.sub)[0];
                    if (user.app_metadata.isAdmin === 'true') {
                        let newEvent = {
                            eventDate: new Date(req.body.eventDate),
                            createDate: new Date(),
                            createdBy: user.name,
                            participants: []
                        }

                        context.bindings.event = newEvent;
                        context.res = {
                            body: context.bindings.event
                        }
                        context.done();
                    } else {
                        context.res = {
                            status: 401,
                            body: {
                                'message': 'User is not authenticated or expired'
                            }
                        }
                        context.done();
                    }
                });
            } else {
                context.res = {
                    status: 409,
                    body: {
                        'message': 'there is already an event with that date'
                    }
                }
                context.done();
            }
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
            status: 401,
            body: {
                'message': 'User is not authenticated or expired'
            }
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