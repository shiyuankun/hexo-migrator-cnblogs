var extend = hexo.extend,
    async = require('async'),
    CnBlogs = require("./lib/CnBlogs").CnBlogs;

extend.migrator.register('cnblogs', function (args) {
    var username = args._.shift();
    if (!username) {
        console.log('\nUsage:hexo migrate cnblogs <username>\n\nMore info:https://github.com/htynkn/hexo-migrator-cnblogs/');
    } else {
        var cnblogs = new CnBlogs();
        cnblogs.setSource(hexo.source_dir);
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
            async.mapLimit(results, 2, function (item, cb) {
                console.log('Start deal with [%s]', item);
                cnblogs.fetchBlogPostAndTransformToHexoPost(item, cb);
            }, function (error, posts) {
                if (error) {
                    callback(error);
                }
                callback(null, posts);
            });
        }, function (posts, callback) {
            async.map(posts, function (item, cb) {
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
            console.log('Because of the image download,please wait a moment.');
        });
    }
});
