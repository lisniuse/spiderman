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
    // 调用生命周期函数
    if (typeof this.config.started === 'function') {
      let data = await this._getIndex(this.indexUrl);
      this.config.started(data);
    }
    // 开始循环爬取
    let i = 0;
    this.resource.push(this.indexUrl);
    do {
      for (const obj of this.resource.urls) {
        if (obj.status !== 1) continue;
        let html = await this._getHtml(obj.url);
        if (!html) continue;
        this._ruleHandle(html, obj.url);
        if (typeof this.options.urlCallback === 'function') {
          this.options.urlCallback(obj.url);
        }
        let urls = this._getUrls(html);
        this.resource.push(urls);
        obj.status = 2;
      }
      i++;
    } while (i <= 100);
  }

  /**
   * 解析规则
   */
  async _parseRule() {
    let rules = this.config.rules;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.auto && rule.url) {
        let html = await this._getHtml(rule.url);
        const $ = cheerio.load(html, {decodeEntities:false});
        rules[i] = parseRule(rule, $);
      }
    }
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

  /**
   * 过滤url
   * @param {*} url 
   */
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
    if (this._isOutsite(url)) {
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
   * 判断是否是站外链接
   */
  _isOutsite(url) {
    let protocol = url.substring(0, 4);
    if (protocol === 'http') {
      let uo = new URL(url);
      if (uo.host !== this.config.domain) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  /**
   * 规则解析
   */
  _ruleHandle(html, url) {
    let rules = this.config.rules;
    const $ = cheerio.load(html, {decodeEntities:false});
    rules.forEach((rule, index) => {
      let checkResult = this._ruleCheck(rule, $);
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
            if (f === 'title' && result.fields[f]) { 
              result.fields[f] = result.fields[f].replace(this.config.articleSubTitle, '');
            }
          }
        }
        if (typeof this.config.callback === 'function') {
          this.config.callback(result, url);
        }
      }
    });
  }

  /**
   * 规则检查
   * @param {Object} rule
   * @param {Object} $
   */
  _ruleCheck(rule, $) {
    let check = rule.check;
    let res = false;
    if (typeof check === 'object') {
      let checkArray = [];
      rule.check.forEach(r => {
        if ($(r).length) checkArray.push(true);
      });
      res = checkArray.length === check.length
    } else {
      res = $(rule.check).length ? true : false;
    }
    return res;
  }

  /**
   * 获取html内容
   * @param {String} url 
   */
  async _getHtml(url) {
    if (!url || url.substring(0, 4) !== 'http') return '';
    let r = '';
    try {
      r = await req.get(url);
      if (r.headers['content-type'].join().includes('text/html')) {
        return this._htmlHandle(r.data);
      } else {
        return '';
      }
    } catch (error) {
      console.log('error url', url);
      console.log(error.message);
      return '';
    }
  }

  /**
   * 处理html内容
   * @param {String} html 
   */
  _htmlHandle(html) {
    const $ = cheerio.load(html, {decodeEntities:false});
    $('img').each((index, el) => {
      let src = $(el).attr('src');
      if (src) {
        let oProtocol = (new URL(this.indexUrl)).protocol;
        let protocol = src.substring(0, 4);
        let protocol2 = src.substring(0, 2);
        if (protocol2 === '//') {
          $(el).attr('src', oProtocol + src);
        } else if (protocol !== 'http') {
          $(el).attr('src', this.indexUrl + src);
        }
      }
    });
    return $.html();
  }

  /**
   * 获取首页数据
   */
  async _getIndex(url) {
    let html = await this._getHtml(url);
    const $ = cheerio.load(html, {decodeEntities:false});
    return {
      title: $('title').text(),
    }
  }
  
}

module.exports = Spiderman;