var clients = require("restify-clients");
var assert = require("assert");
// Creates a JSON client
var client = clients.createClient({
  url: "https://github.com",
});

client.basicAuth("$login", "$password");
client.get("/restify/clients", function (err, req) {
  assert.ifError(err); // connection error

  req.on("result", function (err, res) {
    assert.ifError(err); // HTTP status code >= 400

    res.body = "";
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
      res.body += chunk;
    });

    res.on("end", function () {
      console.log(res.body);
    });
  });
});
