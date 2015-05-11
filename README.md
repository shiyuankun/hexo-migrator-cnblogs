# hexo-migrator-cnblogs [![Build Status](https://secure.travis-ci.org/htynkn/hexo-migrator-cnblogs.png?branch=master)](http://travis-ci.org/htynkn/hexo-migrator-cnblogs)

cnblogs migrator plugin for Hexo

## How To Use
Install the module with:

`npm install hexo-fs`
`npm install hexo-migrator-cnblogs`

The go to your hexo folder,and exec the following command:

```bash
hexo migrate cnblogs <username>
```

Because of the image download,so sometimes you need wait and keep your network connection.

The username is not the your login username in cnblogs but your blog name.

Such as my blog url is `http://www.cnblogs.com/htynkn/`,so the username is `htynkn`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.

Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
2015-05-11 v0.0.5 update cnblogs layout and compatible with hexo 3.0.1 which removes hexo.util.file

2014-09-22 v0.0.4 update dependency version

2014-03-29 v0.0.3 fix *categories* error

2014-03-16 v0.0.2 add image download

2014-03-04 v0.0.1 project init

## Status
[![Build Status](https://travis-ci.org/htynkn/hexo-migrator-cnblogs.png?branch=master)](https://travis-ci.org/htynkn/hexo-migrator-cnblogs)
[![Dependency Status](https://david-dm.org/htynkn/hexo-migrator-cnblogs.png?theme=shields.io)](https://david-dm.org/htynkn/hexo-migrator-cnblogs)
[![DevDependency Status](https://david-dm.org/htynkn/hexo-migrator-cnblogs/dev-status.png?theme=shields.io)](https://david-dm.org/htynkn/hexo-migrator-cnblogs#info=devDependencies)

## License
Copyright (c) 2015 Huang YunKun. Licensed under the MIT license.
