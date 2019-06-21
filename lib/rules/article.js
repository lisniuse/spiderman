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
  let classObj = {
    name: '',
    count: 0
  };
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const count = obj[key];
      if (count > classObj.count) {
        classObj.name = key;
        classObj.count = count;
      }
    }
  }
  return {
    name: 'article',
    check: getClassSelector(classObj.name),
    fields: {
      title: 'title',
      content: getClassSelector(classObj.name)
    }
  }
}