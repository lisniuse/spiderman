class Resource {

  constructor() {
    this.urls = [];
    this.prevLength = 0;
    this.nextLength = 0;
  }

  push(urls) {
    if (typeof urls === 'object') {
      for (const url of urls) {
        this._push(url);
      }
    } else {
      this._push(urls);
    }
  }

  _push(url) {
    if (!this._repeatCheck(url)) return false;
    this.prevLength = this.urls.length;
    this.urls.push({
      url,
      status: 1 // 爬取状态：1：未爬取 2：已爬取 3：爬取失败
    });
    this.nextLength = this.urls.length;
    return true;
  }

  _repeatCheck(url) {
    return this.urls.every(obj => obj.url !== url);
  }
}

module.exports = Resource;
