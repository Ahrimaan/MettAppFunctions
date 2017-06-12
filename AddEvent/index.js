var tokenCheck = require('../checkToken');
var request = require('request');

module.exports = function (context, req, doc) {
    context.log('Token :' + req.headers.token);
    if (tokenCheck(req.headers.token, context)) {
        let newEventDate = (req.body && req.body.eventDate) ?
            new Date(req.body.eventDate) : undefined;
        let newEvent = {
            eventDate: newEventDate,
            createDate: new Date(),
            createdBy: 'TODO',
            participants: []
        }
        if (!allInformationProvided(newEvent)) {
            context.res = {
                status: 400,
                body: {
                    message: ' not all fields are filled '
                }
            };
            context.done();
            return;
        }
        if (isEventAvailable(doc, newEventDate)) {
            context.bindings.event = newEvent;
            context.res = {
                body: context.bindings.event
            }
        } else {
            context.res = {
                status: 409,
                body: {
                    'message': 'there is already an event with that date'
                }
            }
        }
    }
    context.done();
};

function allInformationProvided(newEvent) {
    return newEvent.eventDate !== undefined &&
        newEvent.createdBy !== undefined;
}

function isEventAvailable(doc, eventDate) {
    let filtered = doc.filter(item => new Date(item.EventDate).getDate() === eventDate.getDate());
    return filtered.length < 1;
}