var https = require('https');
var serverInfo = require('./server.js')

var messageJson = function (token, message, cb) {

  if (!token) {
    cb(new Error('Needs token'))
    return
  }

  var result = {'token':token}
  if (message) {
    result['message'] = message
  }
  cb(null,result)
}

var performRequest = function(endpoint,method,data,cb) {

  headers = {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      };

  var options = {
    host: serverInfo.host,
    path: serverInfo.apiPath + endpoint +'/',
    method: method,
    port: 8001,
    headers: headers
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      if (responseString.length > 0) {
        var responseObject = JSON.parse(responseString);
        cb(null,responseObject);
      } else {
        cb(new Error('No response'))
      }

    });
  })
  req.write(data);
  req.end();
}

module.exports.sendMessage = function (token, message, cb) {
  messageJson(token,message,function(err,result){
    if (err) {
      cb(err)
      return
    }

    performRequest('/messages','POST',JSON.stringify(result),function(err,result){
      cb(err,result)
    })
  })

}


module.exports.messageJson = messageJson
