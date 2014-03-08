var fs = require('fs');
var XRegExp = require('xregexp').XRegExp;

exports.mockRequest = function () {
    var reg = new XRegExp('http://www\\.cnblogs\\.com/htynkn/default\\.html\\?page=(\\d+)&OnlyTitle=1');
    return{
        get: function (url, callback) {
            var response = [];
            response.statusCode = 200;
            var responseContentByFile = function (filename, callback) {
                fs.readFile(filename, function (err, data) {
                    response.body = data;
                    callback(null, response);
                });
            };
            if (reg.test(url)) {
                responseContentByFile('test/mock/page_' + reg.exec(url)[1] + '.txt', callback);
            } else if (url === 'http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html') {
                responseContentByFile('test/mock/post_1.txt', callback);
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