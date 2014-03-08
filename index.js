var extend = hexo.extend,
    util = hexo.util,
    _ = require('underscore');

extend.migrator.register('cnblogs', function (args) {
    var username = args._.shift();
    if (!username) {
        console.log('\nUsage:hexo migrate cnblogs <username>\n\nMore info:https://github.com/htynkn/hexo-migrator-cnblogs/');
    } else {
        console.log(hexo.source_dir);
        console.log(username);
    }
});