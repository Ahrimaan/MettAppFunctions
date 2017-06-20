var request = require('request');

var mngtApiOptions = {
    method: 'POST',
    url: process.env.auth0Domain + '/oauth/token',
    headers: { 'content-type': 'application/json' },
    body:
    {
        grant_type: 'client_credentials',
        client_id: process.env.auth0ClientId,
        client_secret: process.env.auth0secret,
        audience: process.env.auth0Domain + '/api/v2/'
    },
    json: true
};

function getAllUsers(callback) {
    request(mngtApiOptions, function (err, response, body) {
        if (err) {
            callback(err, null);
        }
        if (response.statusCode === 200) {
            let accessToken = body.access_token;
            getUserList(accessToken, callback);
        }
        else {
            callback(body, null);
        }
    })
    // Getold token fromdb
    //if expired ornull get new
    //fetch all users
};

function getUserInformation(userId, callback) {
    getAllUsers(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            let singleUser = JSON.parse(result).filter(x => x.user_id == userId)[0];
            callback(null, singleUser);
        }
    });
}

function getUserList(token, callback) {
    let getUserOptions = {
        method: 'GET',
        url: process.env.auth0Domain + '/api/v2/users',
        headers: { 'Authorization': 'Bearer ' + token }
    }
    request(getUserOptions, function (err, resp, body) {
        if (err) {
            callback(err, null);
        }
        if (resp.statusCode === 200) {
            callback(null, body);
        }
        else {
            callback(body, null);
        }
    });
}

function getExpirationDate(expiresIn) {
    let expiredInMillisceonds = expiresIn * 1000;
    return new Date().getTime() + expiredInMillisceonds;
}

function isExpired(expireTime) {
    return new Date().getTime() <= state.user.expiresIn
}

module.exports.getAllUsers = getAllUsers;
module.exports.getUserInformation = getUserInformation;