var tokenCheck = require('../checkToken');
var userService = require('../userService');
var DocumentClient = require('documentdb').DocumentClient;
var client = new DocumentClient(process.env.dbHost, { masterKey: process.env.dbMasterKey });
var docDb = require('../docDbHelper');

module.exports = function (context, req, doc) {
    context.log('Token: ' + req.headers.token);
    let userToken = tokenCheck(req.headers.token, context)
    if (userToken) {
        let participantData = {
            userId: req.body.userId,
            userName: req.body.username,
            value: req.body.value,
            specialNeeds: req.body.special,
            payed: req.body.payed
        }
        context.log(participantData);
        if (doc.filter(x => x._self === req.body.eventId).length <= 0) {
            context.res = {
                status: 404,
                body: 'Event not found !'
            };
            context.done();
        }
        let participants = doc.filter(x => x._self === req.body.eventId)[0].participants;
        context.log(participants);
        if (participants && participants.filter(part => part.userId === participantData.userId).length >= 1) {
            context.res = {
                status: '409',
                body: {
                    'message': 'you already participated in this event, dont try to call my api by hand ;) '
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
                    let model = {
                        eventDate: repRes.eventDate,
                        id: repRes.id,
                        ref: repRes._self,
                        createdBy: repRes.createdBy,
                        createDate: repRes.createDate,
                        participants: repRes.participants
                    }
                    callback(null, model);
                }
            });
        }
    });
}
