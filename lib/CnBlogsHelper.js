var XRegExp = require('xregexp').XRegExp,
    util = require('util'),
    request = require('request') ,
    load = require('cheerio').load,
    _ = require('underscore');

exports.getCategorysAndTags = function (post, html, callback) {
    var targetUrl = 'http://www.cnblogs.com/mvc/blog/BlogPostInfo.aspx', categorys = [], tags = [];
    var blogId = XRegExp.exec(html, new XRegExp('cb_blogId=(?<blogId>\\d+)')).blogId;
    var blogUserGuid = XRegExp.exec(html, new XRegExp('cb_blogUserGuid=\'(?<blogUserGuid>\\S+)\',')).blogUserGuid;
    var postId = XRegExp.exec(html, new XRegExp('cb_entryId=(?<postId>\\d+)')).postId;
    var blogApp = XRegExp.exec(html, new XRegExp('var currentBlogApp =.\'(?<blogApp>\\S+)\',')).blogApp;
    var postData = util.format('{"blogId": %s, "postId": %s, "blogApp": "%s", "blogUserGuid": "%s"}', blogId, postId, blogApp, blogUserGuid);
    request({url: targetUrl, method: "POST", 'content-type': 'application/json', json: JSON.parse(postData)}, function (err, response) {
        var $ = load(response.body);
        var categorysGround = $('div#BlogPostCategory>a');
        var tagsGround = $('div#EntryTag>a');
        if (categorysGround.length > 0) {
            categorys.push(categorysGround.eq(0).text());
        }
        _.each(tagsGround, function (item, index) {
            tags.push(tagsGround.eq(index).text());
        });
        post.categorys = categorys;
        post.tags = tags;
        callback(null, post);
    });
};
exports.getPageFileName = function (url) {
    var nameReg = new XRegExp('p/(?<name>\\S+).html');
    var match = XRegExp.exec(url, nameReg);
    return match ? match.name : null;
};