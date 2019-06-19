module.exports = function (config = {}) {
  // 网站基地址，必填。
  config.baseUrl = 'https://blog.csdn.net'
  // 网站首页地址，不填写则默认取'/'。
  config.indexUrl = '/';
  // 参考文章url，一般为两个，不填写则自动搜寻。
  config.articleUrl = ['/qq_45096812/article/details/90633492', '/luodoudoudou/article/details/90634055'];
  // 网站域名，不填写则自动生成。
  config.domain = 'www.csdn.net';
  // 文章副标题，不填写则自动生成。
  config.articleSubTitle = ' - CSDN博客';
  // 爬取规则，不填写则自动生成。
  config.rules = [{
    name: 'article',
    check: '.blog-content-box .article-header-box',
    fields: {
      title: '.blog-content-box .title-article',
      content: ['.blog-content-box #content_views', '.blog-content-box #js_content']
    }
  }];
  // 设置最大存储url，设0或者不填写则不限制。
  config.maxUrl = 10000;
  // 爬取的内容输出目录，不填写则不输出。
  config.outDir = `./${config.domain}`;
  // 屏蔽的url，支持正则，不填写则不屏蔽。
  config.shieldsUrl = [];
  // 是否允许爬取站外链接，不填写则不允许。
  config.allowOutside = false;
  // 爬取数据回调，可以自定义存储。
  config.callback = function (result) {
    console.log(result);
  }
}