const cheerio = require('cheerio');

const Resource = require('./class/Resource');
const config = require('./config/load')();
const req = require('./request')(config);
const indexUrl = `${config.baseUrl}${config.indexUrl}`;
let resource = new Resource();

(async function main() {

  async function getHtml(url) {
    if (!url) return '';
    let r = await req.get(url);
    return r.data;
  }

  resource.push(indexUrl);

  let i = 0;
  do {
    for (const obj of resource.urls) {
      if (obj.status !== 1) continue;
      const html = await getHtml(obj.url);
      const $ = cheerio.load(html);
      $('a').each((i, el) => {
        let url = $(el).attr('href');
        // 如果是无效链接
        if (!url
          || url === '/'
          || url === '\\'
          || url === indexUrl
          || url[0] === '#'
        ) return;
        // 如果找到了站外链接
        if (url.indexOf('http') === 0 && url.indexOf(config.baseUrl) === -1) {
          // 如果不允许爬取站外链接
          if (!config.allowOutside) {
            return;
          } else {
            resource.push(url);
          }
        }
        if (url[0] === '/' || url[0] === '\\') {
          url = config.baseUrl + url;
        }
        resource.push(url);
      });
      obj.status = 2;
    }
    i++;
  } while (i <= 100)
  console.log(resource.urls);

})();