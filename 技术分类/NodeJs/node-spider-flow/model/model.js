var uuid = require('../utils/util').getUuid;


function URLMap(url, id) {
    this.url = url;
    this.id = id;

}

module.exports = URLMap;