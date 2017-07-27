var request = require('request');
var url = require('url');

var messageJson = function (token, message, priority, cb) {

  if (!token) {
    cb(new Error('Needs token'));
    return;
  }
  if (!priority) {
    priority = "low";
  }
  var result = {'token':token, 'priority': priority};
  if (message) {
    result.message = message;
  }
  cb(null,result);
};

module.exports.sendMessage = function (endpoint, token, message, priority, cb) {

  var urlObject = url.parse(endpoint);
  if (urlObject.protocol !== 'https:') {
    cb(new Error('Requires https'));
    return;
  }

  messageJson(token,message,priority,function(err,result){
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
