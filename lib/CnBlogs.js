'use strict';

var util = require('util'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    load = require('cheerio').load,
    tomd = require('to-markdown').toMarkdown,
    request = require('request'),
    helper = require('../lib/CnBlogsHelper').helper(),
    download = require('download'),
    path = require('path'),
    mkdirp = require('mkdirp');

var CnBlogs = function () {
        var _url_ = 'http://www.cnblogs.com/%s/default.html?page=%d&OnlyTitle=1';
        var _source_;
        var _file_;

        var fetchBlogPost = function (url, callback) {
                request.get(url, function (err, response) {
                    if (!err && response.statusCode === 200) {
                        callback(null, response.body);
                    }
                    else {
                        callback('Fetch post %s failed!', url);
                    }
                });
            },
            extractBaseInformationFormPost = function (url, html, callback) {
                var $ = load(html);
                var post = [];
                post.name = helper.extractFriendlyFileNameFormPostUrl(url);
                post.title = $('a#cb_post_title_url').text();
                post.date = moment($('span#post-date').text()).format('YYYY-MM-DD HH:mm:ss');
                post.content = $('div#cnblogs_post_body').html();
                helper.fetchBlogInfoToGetCategorysAndTags(post, html, function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    callback(null, result);
                });
            },
            dealWithContent = function (post, callback) {
                var content = post.content;
                content = helper.translatePreSectionToHexoCodeFormat(content);
                content = helper.addReadMore(content);
                var $ = load(content);
                var images = $('img');
                var range = _.range(0, images.length);
                async.map(range, function (item, cb) {
                    var imageUrl = images.eq(item).attr('src');
                    var baseName = path.basename(imageUrl);
                    var targetFolder = "/images/" + moment(post.date).format('YYYY/MM');
                    var fullFolderPath = _source_ + targetFolder;
                    mkdirp(fullFolderPath, function (err) {
                        if (err) {
                            cb(err);
                        }
                        download(imageUrl, fullFolderPath);
                        images.eq(item).attr('src', targetFolder + "/" + baseName);
                        cb(null, true);
                    });
                }, function (err) {
                    if (err) {
                        callback(err);
                    }
                    content = $.html();
                    post.content = tomd(content);
                    callback(null, post);
                });
            };
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
                        callback('The blog is not exist.');
                    }
                });
            },
            analyzePageCount: function (username, callback) {
                request.get(util.format(_url_, username, 1), function (error, response) {
                    if (!error && response.statusCode === 200) {
                        var $ = load(response.body);
                        var pager = $('div.pager>a').eq(-2);
                        callback(null, Number(pager.text()));
                    } else {
                        callback('Analyze page count failed!');
                    }
                });
            },
            acquireAllPostLinks: function (username, pageCount, callback) {
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
            fetchBlogPostAndTransformToHexoPost: function (url, callback) {
                async.waterfall([function (cb) {
                    fetchBlogPost(url, cb);
                }, function (html, cb) {
                    extractBaseInformationFormPost(url, html, cb);
                }, function (post, cb) {
                    dealWithContent(post, cb);
                }], function (error, post) {
                    if (error) {
                        callback(error);
                    }
                    callback(null, post);
                });
            },
            savePostToHexoFileSystem: function (post, callback) {
                var content = [
                    'title: ' + post.title,
                    'date: ' + post.date,
                    'tags: ' + '[' + (post.tags ? post.tags : '') + ']',
                    'categorys: ' + '[' + (post.categorys ? post.categorys : '') + ']',
                    '---'
                ];
                var fileSource = _source_ + '_posts/';
                _file_.write(fileSource + (post.name ? post.name : post.title) + '.md', content.join('\n') + '\n\n' + post.content, callback);
            }
        };
    }
    ;

exports.CnBlogs = CnBlogs;