var extend = hexo.extend,
    util = hexo.util,
    _ = require('underscore'),
    async = require('async'),
    request = require('request'),
    CnBlogs = require("./lib/CnBlogs").CnBlogs;

extend.migrator.register('cnblogs', function (args) {
    var username = args._.shift();
    if (!username) {
        console.log('\nUsage:hexo migrate cnblogs <username>\n\nMore info:https://github.com/htynkn/hexo-migrator-cnblogs/');
    } else {
        var cnblogs = new CnBlogs();
        cnblogs.setRequest(request);
        async.waterfall([function (callback) {
            console.log('Verifying username');
            cnblogs.checkUserExist(username, callback);
        }, function (verify, callback) {
            console.log('Getting total page size');
            cnblogs.getPageCount(username, callback);
        }, function (pageCount, callback) {
            console.log('Calculating the total post size');
            cnblogs.getAllPostLink(username, pageCount, callback);
        }], function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);
        });
    }
});