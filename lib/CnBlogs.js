'use strict';

var util = require('util'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    load = require('cheerio').load,
    tomd = require('to-markdown').toMarkdown,
    request = require('request'),
    helper = require('../lib/CnBlogsHelper').helper();

var CnBlogs = function () {
    var _url_ = 'http://www.cnblogs.com/%s/default.html?page=%d&OnlyTitle=1';
    var _source_;
    var _file_;

    return{
        setSource: function (source) {
            _source_ = source;
        },
        setFile: function (file) {
            _file_ = file;
        },
        checkUserExist: function (username, callback) {
            request.get(util.format(_url_, username, 1), function (error, response) {
                if (!error && response.statusCode === 200) {
                    callback(null, true);
                } else {
                    callback('the blog is not exist.');
                }
            });
        },
        getPageCount: function (username, callback) {
            request.get(util.format(_url_, username, 1), function (error, response) {
                if (!error && response.statusCode === 200) {
                    var $ = load(response.body);
                    var pager = $('div.pager>a').eq(-2);
                    callback(null, Number(pager.text()));
                } else {
                    callback('fetch html page failed!');
                }
            });
        },
        getAllPostLink: function (username, pageCount, callback) {
            var getPostLinkByUsernameAndPageIndex = function (username, pageIndex, callback) {
                request.get(util.format(_url_, username, pageIndex), function (err, response) {
                    if (err) {
                        callback(err);
                    }
                    var $ = load(response.body);
                    var postLinks = $('a.postTitle2');
                    var rev = [];
                    _.each(postLinks, function (element, index) {
                        rev.push(postLinks.eq(index).attr('href'));
                    });
                    callback(null, rev);
                });
            };
            async.map(_.range(1, pageCount + 1), function (item, cb) {
                getPostLinkByUsernameAndPageIndex(username, item, cb);
            }, function (err, results) {
                if (err) {
                    throw err;
                }
                var result = _.reduceRight(results, function (a, b) {
                    return a.concat(b);
                }, []);
                callback(null, result);
            });
        },
        fetchAndTransform: function (url, callback) {
            request.get(url, function (err, response) {
                if (!err && response.statusCode === 200) {
                    var $ = load(response.body);
                    var post = [];
                    post.name = helper.getPageFileName(url);
                    post.title = $('a#cb_post_title_url').text();
                    post.date = moment($('span#post-date').text()).format('YYYY-MM-DD HH:mm:ss');
                    var content = $('div#cnblogs_post_body').html();
                    post.content = tomd(helper.translatePreToHexoCodeFormat(content));
                    helper.getCategorysAndTags(post, response.body, function (err, result) {
                        callback(null, result);
                    });
                } else {
                    callback(util.format('fetch post[link:%s] page failed!', url));
                }
            });
        },
        savePostToHexo: function (post, callback) {
            var content = [
                'title: ' + post.title,
                'date: ' + post.date,
                'tags: ' + '[' + (post.tags ? post.tags : '') + ']',
                'categorys: ' + '[' + (post.categorys ? post.categorys : '') + ']',
                '---'
            ];
            _file_.write(_source_ + (post.name ? post.name : post.title) + '.md', content.join('\n') + '\n\n' + post.content, callback);
        }
    };
};

exports.CnBlogs = CnBlogs;