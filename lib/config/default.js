module.exports = function (config = {}) {
  // 网站基地址，必填。
  config.baseUrl = 'https://www.csdn.net'
  // 网站首页地址，不填写则默认取'/'。
  config.indexUrl = '/';
  // 参考文章url，一般为两个，不填写则自动搜寻。
  config.articleUrl = ['/qq_45096812/article/details/90633492', '/luodoudoudou/article/details/90634055'];
  // 网站域名，不填写则自动生成。
  config.domain = '';
  // 文章副标题，不填写则自动生成。
  config.articleSubTitle = '';
  // 爬取规则，不填写则自动生成。
  config.rules = {};
  // 设置最大存储url，设0或者不填写则不限制。
  config.maxUrl = 0;
  // 爬取的内容输出目录，不填写则不输出。
  config.outDir = '';
  // 屏蔽的url，支持正则，不填写则不屏蔽。
  config.shieldsUrl = [];
  // 是否允许爬取站外链接，不填写则不允许。
  config.allowOutside = false;
  // 自定义header
  config.headers = {
    'Accept': '*/*',
    'Content-Type': 'text/plain;charset=UTF-8',
    'Origin': config.baseUrl,
    'Referer': `${config.baseUrl}/`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
  };
  // 爬取数据回调，可以自定义存储。
  config.callback = function (result = {}) {};
  return config;
}