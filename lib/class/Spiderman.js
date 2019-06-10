// @ts-nocheck
const cheerio = require('cheerio');
const _ = require('lodash');
const { URL } = require('url');

let request = require('../request');
let req = {};

const Resource = require('./Resource');

class Spiderman {

  constructor(options = {}) {
    this.resource = new Resource();
    this.config = options.config;
    req = request(this.config);
    this.indexUrl = `${this.config.baseUrl}${this.config.indexUrl}`;
  }

  /**
   * 开始爬取
   */
  async start() {
    let i = 0;
    this.resource.push(this.indexUrl);
    do {
      for (const obj of this.resource.urls) {
        if (obj.status !== 1) continue;
        console.log(obj.url);
        let html = await this._getHtml(obj.url); 
        let urls = await this._getUrls(html);
        this.resource.push(urls);
        obj.status = 2;
      }
      i++;
    } while (i <= 100);
  }

  /**
   * 获取html内的所有符合条件的url
   * @returns {Array}
   */
  async _getUrls(html) {
    const $ = cheerio.load(html);
    const urls = [];
    $('a').each((i, el) => {
      let url = $(el).attr('href');
      let res = this._getUrl(url);
      if (res) urls.push(res);
    });
    return _.uniq(urls);
  }

  async _getUrl(url) {
    // 如果是无效链接
    if (!url
      || url === '/'
      || url === '\\'
      || url === this.indexUrl
      || url[0] === '#'
      || url.indexOf('javascript:void')
    ) return;
    // 如果找到了站外链接
    if (url.indexOf('http') === 0 && url.indexOf(this.config.baseUrl) === -1) {
      // 如果不允许爬取站外链接
      if (!this.config.allowOutside) {
        return;
      } else {
        let uo = new URL(url);
        url = uo.href.replace(uo.hash, '');
        return url;
      }
    } else { // 如果是站内链接
      if (url[0] === '/' || url[0] === '\\') {
        url = this.config.baseUrl + url;
      } else if ( url.indexOf('http') === -1 ) {
        url = this.config.baseUrl + '/' + url;
      }
      let uo = new URL(url);
      url = uo.href.replace(uo.hash, '');
      return url;
    }
  }

  async _getHtml(url) {
    if (!url) return '';
    let r = await req.get(url);
    return r.data;
  }
  
}

module.exports = Spiderman;