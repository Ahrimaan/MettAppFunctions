var tokenCheck = require('../checkToken');

module.exports = function (context, req, doc) {
    context.log('Token :' + req.headers.token);
    if (tokenCheck(req.headers.token, context)) {
        let newEventDate = new Date(req.body.eventDate);
        if (isEventAvailable(doc, newEventDate)) {
            let newEvent = {
                eventDate:newEventDate,
                createDate:new Date(),
                createdBy:'TODO',
                participants:[]
            }
            context.bindings.event = newEvent;
            context.res = {
                body: context.bindings.event
            };
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

function isEventAvailable(doc, eventDate) {
    let filtered = doc.filter(item => new Date(item.EventDate).getDate() === eventDate.getDate());
    return filtered.length < 1;
}