var requestQueen = [];
var urlMap = require('../model/model');

function addUrlMap(urlMap) {
    var map = new Map()
    map.set(urlMap.id, urlMap.url)
    requestQueen.push(map);
}