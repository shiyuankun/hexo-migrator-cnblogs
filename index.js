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
        cnblogs.setSource(hexo.source_dir + '_posts/');
        cnblogs.setFile(hexo.util.file);
        async.waterfall([function (callback) {
            console.log('Verifying username');
            cnblogs.checkUserExist(username, callback);
        }, function (verify, callback) {
            console.log('Getting total page size');
            cnblogs.analyzePageCount(username, callback);
        }, function (pageCount, callback) {
            console.log('Calculating the total post size');
            cnblogs.acquireAllPostLinks(username, pageCount, callback);
        }, function (results, callback) {
            async.map(results, function (item, cb) {
                cnblogs.fetchBlogPostAndTransformToHexoPost(item, cb);
            }, function (error, posts) {
                if (error) {
                    callback(error);
                }
                callback(null, posts);
            });
        }, function (posts, callback) {
            async.map(posts, function (item, cb) {
                console.log('Dealing with post:%s', item.title);
                cnblogs.savePostToHexoFileSystem(item, cb);
            }, function (error) {
                if (error) {
                    callback(error);
                }
                callback(null, posts.length);
            });
        }], function (err, result) {
            if (err) {
                throw err;
            }
            console.log('Migrate %s posts sucess.', result);
        });
    }
});