var MongoClient = require('mongodb').MongoClient;
var url = require('../config/run.config').mongodbUrl

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("MongoClient 数据库已创建!");
    db.close();
});