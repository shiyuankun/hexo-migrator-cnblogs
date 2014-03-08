'use strict';

var util = require('util'),
    cheerio = require('cheerio'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    tomd = require('to-markdown').toMarkdown;

exports.CnBlogs = function () {
    var _url_ = 'http://www.cnblogs.com/%s/default.html?page=%d&OnlyTitle=1';
    var _request_;
    return{
        setRequest: function (request) {
            _request_ = request;
        },
        checkUserExist: function (username, callback) {
            _request_.get(util.format(_url_, username, 1), function (error, response) {
                if (!error && response.statusCode === 200) {
                    callback(null, true);
                } else {
                    callback('the blog is not exist.');
                }
            });
        },
        getPageCount: function (username, callback) {
            _request_.get(util.format(_url_, username, 1), function (error, response) {
                if (!error && response.statusCode === 200) {
                    var $ = cheerio.load(response.body);
                    var pager = $('div.pager>a').eq(-2);
                    callback(null, Number(pager.text()));
                } else {
                    callback('fetch html page failed!');
                }
            });
        },
        getAllPostLink: function (username, pageCount, callback) {
            var getPostLinkByUsernameAndPageIndex = function (username, pageIndex, callback) {
                _request_.get(util.format(_url_, username, pageIndex), function (err, response) {
                    if (err) {
                        callback(err);
                    }
                    var $ = cheerio.load(response.body);
                    var postLinks = $('a.postTitle2');
                    var rev = [];
                    _.each(postLinks, function (element, index) {
                        rev.push(postLinks.eq(index).attr('href'));
                    });
                    callback(null, rev);
                });
            };
            var targetArray = [];
            for (var index = 1; index <= pageCount; index++) {
                targetArray.push(index);
            }
            async.map(targetArray, function (item, cb) {
                getPostLinkByUsernameAndPageIndex(username, item, cb);
            }, function (err, results) {
                if (err) {
                    throw err;
                }
                var result = [];
                _.each(results, function (element) {
                    result = result.concat(element);
                });
                callback(null, result);
            });
        },
        fetchAndTransform: function (url, callback) {
            _request_.get(url, function (err, response) {
                if (!err && response.statusCode === 200) {
                    var $ = cheerio.load(response.body);
                    var post = [];
                    post.title = $('a#cb_post_title_url').text();
                    post.date = moment($('span#post-date').text()).format('YYYY-MM-DD HH:mm:ss');
                    post.content = tomd($('div#cnblogs_post_body').html());
                    callback(null, post);
                } else {
                    callback(util.format('fetch post[link:%s] page failed!', url));
                }
            });
        }
    };
};