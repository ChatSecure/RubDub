var request = require('request');

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

module.exports.sendMessage = function (endpoint, token, message, cb) {
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
