var request = require('request');
var url = require('url');

var messageJson = function (token, message, cb) {

  if (!token) {
    cb(new Error('Needs token'));
    return;
  }

  var result = {'token':token, 'type': 'message'};
  if (message) {
    result.message = message;
  }
  cb(null,result);
};

module.exports.sendMessage = function (endpoint, token, message, cb) {

  var urlObject = url.parse(endpoint);
  if (urlObject.protocol !== 'https:') {
    cb(new Error('Requires https'));
    return;
  }

  messageJson(token,message,function(err,result){
    if (err) {
      cb(err);
      return;
    }
    request.post(endpoint,{
      formData:result,
      json:true
    },function(err, res, body){
      cb(err,res);
    });
  });
};

module.exports.messageJson = messageJson;
