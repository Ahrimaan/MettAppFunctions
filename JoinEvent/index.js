var tokenCheck = require('../checkToken');
var userService = require('../userService');
var DocumentClient = require('documentdb').DocumentClient;
var client = new DocumentClient(process.env.dbHost, { masterKey: process.env.dbMasterKey });
var docDb = require('../docDbHelper');

module.exports = function (context, req, doc) {
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
            if (doc.filter(x => x._self === req.body.eventId).length <= 0) {
                context.res = {
                    status: 404
                };
                context.done();
            }
            if (doc.filter(x => x._self === req.body.eventId)[0].participants.filter(part => part.userId === result.user_id).length >= 1) {
                context.res = {
                    status:'409',
                    body: {
                        'message':'you already participated in this event, dont try to call my api by hand ;) '
                    }
                }
                context.done();
            } else {
                updateItem(req.body.eventId, participantData, (err, result) => {
                    if (err) {
                        context.res = {
                            status: 500,
                            body: err
                        };
                        context.done();
                    } else {
                        context.res = {
                            body: result
                        };
                        context.done();
                    }
                });
            }
        });
    }
    else {
        context.res = {
            status: 401,
            body: 'token was wrong expired or missing'
        };
        context.done();
    }
};

function updateItem(eventId, participant, callback) {
    client.readDocument(eventId, (err, result) => {
        if (err) {
            callback(err);
        }
        else {
            let event = result;
            event.participants.push(participant);
            client.replaceDocument(eventId, event, (repErr, repRes) => {
                if (repErr) {
                    callback(repErr);
                }
                else {
                    callback(null, repRes);
                }
            });
        }
    });

    /* docDb.getOrCreateDatabase(client, 'MettApp', (err, result) => {
        if (err) {
            callback(err);
        }
        else {
            docDb.getOrCreateCollection(client, result._self, 'MettApp', (colErr, colRes) => {
                if (colErr) {
                    callback(colErr);
                } else {
                    var querySpec = {
                        query: 'SELECT * FROM root r WHERE r._self = @id',
                        parameters: [{
                            name: '@id',
                            value: eventId
                        }]
                    };
                    client.queryDocuments(colRes._self, querySpec).toArray(function (docErr, doc) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            let event = doc[0];
                            event.participants.push(participant);
                            client.replaceDocument(event._self, event, (repErr, repRes) => {
                                if (repErr) {
                                    callback(repErr);
                                }
                                else {
                                    callback(null, repRes);
                                }
                            })
                        };
                    });
                }
            });
        }
    }); */
}
