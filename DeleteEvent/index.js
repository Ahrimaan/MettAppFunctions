var tokenCheck = require('../checkToken');
var userService = require('../userService');

var DocumentClient = require('documentdb').DocumentClient;
var client = new DocumentClient(process.env.dbHost, { masterKey: process.env.dbMasterKey });

var databaseDefinition = { id: "MettApp" };
var collectionDefinition = { id: "Events" };

module.exports = function (context, req) {
    context.log('Token :' + req.headers.token);
    let token = tokenCheck(req.headers.token, context);
    if (token) {
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
                client.deleteDocument(req.body.eventRef, function(err)  {
                    if (err) {
                        context.res = {
                            status: 500,
                            body: err
                        };
                        context.done();
                        return;
                    }
                    context.res = {
                        body: 'Event Deleted'
                    };
                    context.done();
                    return;
                });
            } else {
                context.res = {
                    status: 401,
                    body: {
                        'message': 'User has no permission to delete events'
                    }
                }
                context.done();
            }
        });


    }
};