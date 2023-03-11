var request = require("request");
var utils = require("./utils");
var defaultOptions = {
  headers: {
    Cookie: "",
  },
};

var downLoadUrl = function (url, new_options = {}) {
  var options = utils.extend(defaultOptions, new_options);
  request(url, options, function (err, res, body) {
    if (err) console.error(err);
    if (res.statusCode == 200) {
      return JSON.stringify(body);
    }
  });
};

module.exports = {
  downLoadUrl,
};
