require('should');

var proxyquire = require('proxyquire'),
    mockRequest = require('./mock/mockRequest').mockRequest(),
    tmp = require('temporary'),
    mockHelper = proxyquire('../lib/CnBlogsHelper', {request: mockRequest}),
    CnBlogs = proxyquire("../lib/CnBlogs", {'request': mockRequest, '../lib/CnBlogsHelper': mockHelper}).CnBlogs;

describe('cnblogs_test', function () {
    var cnblogs;

    beforeEach(function (done) {
        cnblogs = new CnBlogs();
        done();
    });

    it('should_throw_err_when_username_not_exist', function (done) {
        cnblogs.checkUserExist('htynkn_fake_name', function (err) {
            err.should.not.equal(null);
            done();
        });
    });

    it('should_get_true_when_username_exist', function (done) {
        cnblogs.checkUserExist('htynkn', function (err, result) {
            result.should.equal(true);
            done();
        });
    });

    it('should_get_count_5_when_analyze_page_count', function (done) {
        cnblogs.analyzePageCount('htynkn', function (err, result) {
            result.should.equal(5);
            done();
        });
    });

    it('should_get_68_post_links_when_acquire_all_post_links', function (done) {
        cnblogs.acquireAllPostLinks('htynkn', 5, function (err, result) {
            result.length.should.equal(68);
            done();
        });
    });


    it('can_fetch_and_transform_blog_to_hexo_post', function (done) {
        var dir=new tmp.Dir();
        cnblogs.setSource(dir.path);
        cnblogs.fetchBlogPostAndTransformToHexoPost('http://www.cnblogs.com/htynkn/p/gradle_svn_sae.html', function (err, post) {
            post.title.should.equal('使用Gradle自动发布Java Web到SAE');
            post.date.should.equal('2014-01-17 11:59:00');
            post.categorys[0].should.equal('其他');
            done();
        });
    });
});
