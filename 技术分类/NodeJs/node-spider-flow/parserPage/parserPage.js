var cheerio = require('cheerio');


function getDocument(res) {
    return cheerio.parseHTML(res)
}



module.exports = {
    getDocument
}