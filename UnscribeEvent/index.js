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
            context.log(result);
            if (doc.filter(x => x._self === req.body.eventId).length <= 0) {
                context.res = {
                    status: 404
                };
                context.done();
            }
            if (doc.filter(x => x._self === req.body.eventId)[0].participants.filter(part => part.userId === result.user_id).length <= 0) {
                context.res = {
                    status:'409',
                    body: {
                        'message':'you are not subscribed, dont try to call my api by hand ;) '
                    }
                }
                context.done();
            } else {
                updateItem(req.body.eventId, result.user_id, (err, result) => {
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

function updateItem(eventId, userId, callback) {
    client.readDocument(eventId, (err, result) => {
        if (err) {
            callback(err);
        }
        else {
            let event = result;
            event.partticipants =  event.participants.splice(event.participants.findIndex(part => part.userId === userId),1);

            client.replaceDocument(eventId, event, (repErr, repRes) => {
                if (repErr) {
                    callback(repErr);
                }
                else {
                    callback(null, 'unscribed');
                }
            });
        }
    });
}
