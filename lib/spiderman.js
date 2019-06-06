let obj = {};
jQuery("p").each((index, el) => {
  let parentEl = jQuery(el).parent();
  let parentClassName = jQuery(parentEl).attr('class');
  while (!parentClassName) {
    parentEl = jQuery(parentEl).parent();
    parentClassName = jQuery(parentEl).attr('class');
  }
  if (!parentClassName) return;
  if (!obj[parentClassName]) obj[parentClassName] = 0;
  obj[parentClassName]++;
});
console.log(obj);