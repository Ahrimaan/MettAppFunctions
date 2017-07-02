var tokenCheck = require('../checkToken');
var userService = require('../userService');
var DocumentClient = require('documentdb').DocumentClient;
var client = new DocumentClient(process.env.dbHost, { masterKey: process.env.dbMasterKey });
var docDb = require('../docDbHelper')

module.exports = function (context, req, doc) {
    context.log('Token :' + req.headers.token);
    let token = tokenCheck(req.headers.token, context);
    if (token) {
        context.log('token check passed : ' + token.sub);
        if (allInformationProvided(req.body)) {
            let newEventDate = new Date(req.body.eventDate);
            context.log('all information provided: ' + newEventDate)
            if (isEventAvailable(doc, newEventDate)) {
                context.log('Event is available: ' + newEventDate)
                userService.getAllUsers(function (err, data) {
                    if (err) {
                        context.res = {
                            status: 500,
                            body: err
                        };
                        context.done();
                        return;
                    }
                    let users = JSON.parse(data);
                    let user = users.filter(x => x.user_id === token.sub)[0];
                    if (user.app_metadata.isAdmin === 'true') {
                        let newEvent = {
                            eventDate: new Date(req.body.eventDate),
                            createDate: new Date(),
                            createdBy: user.name,
                            createdById: token.sub,
                            participants: []
                        }
                        addItem(newEvent, (error, result) => {
                            if (error) {
                                context.res = {
                                    status: 500,
                                    body: error
                                };
                                context.done();
                                return;
                            }
                            newEvent.id = result.id;
                            newEvent.ref = result._self;
                            context.res = {
                                body: newEvent
                            };
                            context.done();
                        })
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

function addItem(newItem, callback) {
    docDb.getOrCreateDatabase(client, 'MettApp', (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        docDb.getOrCreateCollection(client, result._self, 'Events', (collErr, collResult) => {
            if (collErr) {
                callback(collErr, null);
                return;
            }
            client.createDocument(collResult._self, newItem, (createErr, doc) => {
                if (createErr) {
                    callback(createErr, null);
                    return;
                }
                callback(null, doc);
            })
        });
    })
}