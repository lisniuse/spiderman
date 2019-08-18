// @ts-nocheck

const iconv = require('iconv-lite');

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
    this.urlRules = [];
    this.config.rules.forEach((obj) => {
      if (typeof obj.check === 'object') {
        if (obj.check.url) {
          this.urlRules.push(obj.check.url);
        }
      }
    });
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
        await this._ruleHandle(html, obj.url);
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
      url.indexOf('javascript:') !== -1 ||
      url.indexOf('ftp:') !== -1
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
  async _ruleHandle(html, url) {
    let rules = this.config.rules;
    const $ = cheerio.load(html, {decodeEntities:false});
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index];
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
          await this.config.callback({
            result,
            url,
            request: req,
            cheerio
          });
        }
      }
    }
  }

  /**
   * 规则检查
   * @param {Object} rule
   * @param {Object} $
   */
  _ruleCheck(rule, $) {
    let check = ''
    let res = false;
    if (_.isPlainObject(rule.check)) {
      check = rule.check.el;
    } else {
      check = rule.check;
    }
    if (_.isArray(check)) {
      let checkArray = [];
      rule.check.forEach(r => {
        if ($(r).length) checkArray.push(true);
      });
      res = checkArray.length === check.length
    } else if (typeof check === 'string') {
      res = $(rule.check).length ? true : false;
    }
    return res;
  }

  /**
   * 获取html内容
   * @param {String} url 
   */
  async _getHtml(url) {
    // 检测url是否匹配
    let hasMatch = false;
    if (this.urlRules.length) {
      this.urlRules.forEach((reg) => {
        if (hasMatch === false) { 
          hasMatch = Boolean(url.match(reg));
        }
      });
    } else {
      hasMatch = true;
    }
    if (!hasMatch || !url || url.substring(0, 4) !== 'http') return '';
    let r = '';
    let result = '';
    do {
      try {
        r = await req.get(url);
        let charset = this.config.charset;
        let data = iconv.decode(r.data, charset).toString();
        if (r.headers['content-type'].join().includes('text/html')) {
          result = this._htmlHandle(data);
        } else {
          result = '';
        }
      } catch (error) {
        console.log('error url', url);
        console.log(error.message);
        result = '';
      }
    } while (result === '');
    return result;
  }

  /**
   * 处理html内容
   * @param {String} html 
   */
  _htmlHandle(html) {
    const $ = cheerio.load(html, {decodeEntities:false});
    // 处理图片
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