require('should');

var getCategorysAndTags = require("../lib/CnBlogsHelper").getCategorysAndTags,
    getPageFileName = require('../lib/CnBlogsHelper').getPageFileName,
    request = require('request');

describe('cnblogs_test', function () {

    it('should_get_param_to_get_detail_information_about_post', function (done) {
        request.get('http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html', function (err, data) {
            if (err) {
                throw err;
            }
            getCategorysAndTags([], data.body, function (errpr, result) {
                if (errpr) {
                    throw errpr;
                }
                result.categorys.length.should.equal(1);
                result.tags.length.should.equal(2);
                done();
            });
        });
    });

    it('should_get_page_url_name', function () {
        getPageFileName('http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html').should.equal('gradle_svn_sae');
    });
});
