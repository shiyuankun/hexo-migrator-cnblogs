var fs = require('fs');
var XRegExp = require('xregexp').XRegExp;

exports.mockRequest = function () {
    var reg = new XRegExp('http://www\\.cnblogs\\.com/htynkn/default\\.html\\?page=(\\d+)&OnlyTitle=1');
    return{
        get: function (url, callback) {
            var response = [];
            response.statusCode = 200;
            if (reg.test(url)) {
                fs.readFile('test/mock/page_' + reg.exec(url)[1] + '.txt', function (err, data) {
                    response.body = data;
                    callback(null, response);
                });
            }
            else if (url === 'http://www.cnblogs.com/htynkn_fake_name/default.html?page=1&OnlyTitle=1') {
                response.statusCode = 404;
                callback('error', response);
            }
            else {
                callback('no fit request');
            }
        }
    };
};