require('should');

var proxyquire = require('proxyquire'),
    mockRequest = require('./mock/mockRequest').mockRequest();

var helper = proxyquire("../lib/CnBlogsHelper", {request: mockRequest}).helper();

describe('cnblogs_helper_test', function () {

    it('should_get_param_to_get_detail_information_about_post', function (done) {
        mockRequest.get('http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html', function (err, data) {
            if (err) {
                throw err;
            }
            helper.fetchBlogInfoToGetCategorysAndTags([], data.body, function (errpr, result) {
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
        helper.extractFriendlyFileNameFormPostUrl('http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html').should.equal('gradle_svn_sae');
    });
});
