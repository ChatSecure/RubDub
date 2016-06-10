var https = require('https');
var url = require('url');
var PORT = 443;

var messageJson = function (token, message, cb) {

  if (!token) {
    cb(new Error('Needs token'));
    return;
  }

  var result = {'token':token};
  if (message) {
    result.message = message;
  }
  cb(null,result);
};

var performRequest = function(host,path,method,data,cb) {

  headers = {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  };

  var options = {
    host: host,
    path: path,
    method: method,
    port: PORT,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(newData) {
      responseString += newData;
    });

    res.on('end', function() {
      if (responseString.length > 0) {
        var responseObject = JSON.parse(responseString);
        cb(null,responseObject);
      } else {
        cb(new Error('No response'));
      }

    });
  });
  req.write(data);
  req.end();
};

module.exports.sendMessage = function (endpoint, token, message, cb) {
  messageJson(token,message,function(err,result){
    if (err) {
      cb(err);
      return;
    }
    var host = "";
    var path = "";
    if (endpoint) {
      var parsed = url.parse(endpoint);
      host = parsed.host;
      path = parsed.path;
    }
    //Need to catch errors better
    performRequest(host,path,'POST',JSON.stringify(result),function(err,result){
      cb(err,result);
    });
  });
};

module.exports.messageJson = messageJson;
