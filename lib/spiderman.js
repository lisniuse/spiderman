const cheerio = require('cheerio');

const config = require('./config/load')();
const req = require('./request')(config);
const indexUrl = `${config.baseUrl}/${config.indexUrl}`;

(async function main() {
  async function getHtml(url) {
    if (!url) return '';
    let r = await req.get(url);
    return r.data;
  }
  const html = await getHtml(indexUrl);
  const $ = cheerio.load(html);
  let els = [];
  $('a').each((el, i) => {
    els.push(el);
  });
  console.log(els.length);
})();
