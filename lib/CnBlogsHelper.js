var XRegExp = require('xregexp').XRegExp,
    util = require('util'),
    request = require('request') ,
    load = require('cheerio').load,
    path = require('path'),
    _ = require('underscore');

var fetchBlogInfoToGetCategorysAndTags = function (post, html, callback) {
        var targetUrl = 'http://www.cnblogs.com/mvc/blog/BlogPostInfo.aspx',
            categorys = [],
            tags = [];
        var blogId = XRegExp.exec(html, new XRegExp('cb_blogId=(?<blogId>\\d+)')).blogId,
            blogUserGuid = XRegExp.exec(html, new XRegExp('cb_blogUserGuid=\'(?<blogUserGuid>\\S+)\',')).blogUserGuid,
            postId = XRegExp.exec(html, new XRegExp('cb_entryId=(?<postId>\\d+)')).postId,
            blogApp = XRegExp.exec(html, new XRegExp('var currentBlogApp =.\'(?<blogApp>\\S+)\',')).blogApp;
        var postData = util.format('{"blogId": %s, "postId": %s, "blogApp": "%s", "blogUserGuid": "%s"}', blogId, postId, blogApp, blogUserGuid);

        request.post(targetUrl, {json: JSON.parse(postData)}, function (err, response) {
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
    },
    extractFriendlyFileNameFormPostUrl = function (url) {
        return path.basename(url, ".html");
    },
    translatePreSectionToHexoCodeFormat = function (post) {
        var $ = load(post);
        var preCodes = $('pre');
        var languageTemplete = '``` %s\n%s\n```';
        var languageRegex = new XRegExp('brush:.{0,}(js|groovy|java|as3|actionscript3|bash|shell|cf|coldfusion|c-sharp|csharp|cpp|c|css|delphi|pas| pascal|diff|patch|erl|erlang|groovy|js|jscript|javascript|java|jfx|javafx|perl|pl|php|plain|text|ps|powershell|py|python|rails|ror|ruby|scala|sql|vb|vbnet|xml|xhtml|xslt|html|xhtml);');
        _.each(preCodes, function (element, index) {
            var preCode = preCodes.eq(index);
            var match = languageRegex.exec(preCode.attr('class'));
            var language = '';
            if (match && match.length > 1) {
                language = match[1].trim();
            }
            preCode.replaceWith(util.format(languageTemplete, language, preCode.text()));
        });
        return $.html();
    };

var helper = function () {
    return {
        fetchBlogInfoToGetCategorysAndTags: fetchBlogInfoToGetCategorysAndTags,
        extractFriendlyFileNameFormPostUrl: extractFriendlyFileNameFormPostUrl,
        translatePreSectionToHexoCodeFormat: translatePreSectionToHexoCodeFormat
    };
};

exports.helper = helper;