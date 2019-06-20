// @ts-nocheck
const cheerio = require('cheerio');
const _ = require('lodash');
const { URL } = require('url');

const request = require('../request');
const parseRule = require('../core/parseRule');
const Resource = require('./Resource');

let req = {};

class Spiderman {

  constructor(options = {}) {
    this.options = options;
    this.resource = new Resource();
    this.config = options.config;
    req = request(this.config);
    this.indexUrl = `${this.config.baseUrl}${this.config.indexUrl}`;
  }

  /**
   * 开始爬取
   */
  async start() {
    // 分析规则
    await this._parseRule();

    // let i = 0;
    // this.resource.push(this.indexUrl);
    // do {
    //   for (const obj of this.resource.urls) {
    //     if (obj.status !== 1) continue;
    //     let html = await this._getHtml(obj.url);
    //     this._ruleHandle(html);
    //     if (typeof this.options.urlCallback === 'function') {
    //       this.options.urlCallback(obj.url);
    //     }
    //     let urls = this._getUrls(html);
    //     this.resource.push(urls);
    //     obj.status = 2;
    //   }
    //   i++;
    // } while (i <= 100);
  }

  /**
   * 解析规则
   */
  async _parseRule() {
    let rules = this.config.rules;
    rules.forEach(async (rule, index) => {
      if (rule.auto && rule.url) {
        let html = await this._getHtml(rule.url);
        const $ = cheerio.load(html, {decodeEntities:false});
        rule = parseRule(rule, $);
      }
    });
  }

  /**
   * 获取html内的所有符合条件的url
   * @returns {Array}
   */
  _getUrls(html) {
    const $ = cheerio.load(html);
    const urls = [];
    $('a').each((i, el) => {
      let url = $(el).attr('href');
      let res = this._getUrl(url);
      if (res) urls.push(res);
    });
    return _.uniq(urls);
  }

  _getUrl(url) {
    // 如果是无效链接
    if (!url ||
      url === '/' ||
      url === '\\' ||
      url === this.indexUrl ||
      url[0] === '#' ||
      url.indexOf('javascript:') !== -1
    ) {
      return;
    }
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
      } else if (url.indexOf('http') === -1) {
        url = this.config.baseUrl + '/' + url;
      }
      let uo = new URL(url);
      url = uo.href.replace(uo.hash, '');
      return url;
    }
  }

  /**
   * 规则解析
   */
  _ruleHandle(html) {
    let rules = this.config.rules;
    const $ = cheerio.load(html, {decodeEntities:false});
    rules.forEach((rule, index) => {
      // let _rule = rule;
      // if (rule.auto) _rule = parseRule(rule, $);
      let checkResult = $(_rule.check).length ? true : false;
      if (checkResult) {
        let result = {
          name: rule.name,
          fields: {}
        }
        let fields = rule.fields;
        for (const f in fields) {
          if (fields.hasOwnProperty(f)) {
            let selector = fields[f];
            let _selector = '';
            if (typeof selector === 'object') {
              selector.forEach(s => {
                if ($(s).length) _selector = s;
              });
            } else {
              _selector = selector;
            }
            result.fields[f] = $(_selector).html();
          }
        }
        if (typeof this.config.callback === 'function') {
          this.config.callback(result);
        }
      }
    });
  }

  /**
   * 获取html内容
   * @param {String} url 
   */
  async _getHtml(url) {
    if (!url) return '';
    let r = await req.get(url);
    return r.data;
  }

}

module.exports = Spiderman;