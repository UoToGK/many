function hashCode(url) {
  var hash = 0;
  if (url.length == 0) return hash;
  for (i = 0; i < url.length; i++) {
    char = url.charCodeAt(i);
    hash = (hash << 8) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

function extend(target) {
  for (var i = 1, len = arguments.length; i < len; i++) {
    for (var prop in arguments[i]) {
      if (arguments[i].hasOwnProperty(prop)) {
        target[prop] = arguments[i][prop];
      }
    }
  }
}

module.exports = {
  hashCode,
  extend,
};
