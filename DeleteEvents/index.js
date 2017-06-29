Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}
var mongoClient = require("mongodb").MongoClient;


module.exports = function (context, myTimer) {
    let expirationDate = new Date().addDays(-1);
    mongoClient.connect(process.env.dbEndpoint, function (err, db) {
        var collection = db.collection('Events');
        var items = collection.find();
        items.forEach(item => {
            if (item.eventDate > expirationDate) {
                collection.deleteOne({ id: item.id }, function (err, result) {

                });
            }
        });
        context.done();
    });

};