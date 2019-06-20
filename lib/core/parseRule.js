const AUTO = require('../config/auto')();
const pArticle = require('../rules/article');

module.exports = function(rule, $) {
  if (rule.auto === AUTO.ARTICLE) {
    return pArticle($);
  }
}