const getClassSelector = function(className) {
  className = className.replace(/(^\s*)|(\s*$)/g, '');
  return '.' + className.replace(/\s+/g, ' .');
}

module.exports = function($) {
  let jQuery = $;
  let obj = {};
  jQuery("p").each((index, el) => {
    pClass = jQuery(el).attr('class');
    pStyle = jQuery(el).attr('style');
    if (!pClass || pStyle) {
      let parentEl = jQuery(el).parent();
      let parentClassName = jQuery(parentEl).attr('class');
      if (!parentClassName) return;
      if (!obj[parentClassName]) obj[parentClassName] = 0;
      let parentCount = jQuery(getClassSelector(parentClassName)).length;
      if (parentCount === 1) obj[parentClassName]++;
    }
  });
  console.log(obj);
}