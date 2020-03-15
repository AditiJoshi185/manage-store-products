const express = require("express");
var app = express();
const Promise = require("bluebird");

const mongolib = require("./../services/mongoLib");
const products = require("./../services/products");

(function startService() {
  return Promise.coroutine(function*() {
    yield mongolib.connectMongo();
    yield require("./../services/agenda").initializeAgenda();
    var listener = app.listen(8080, function() {
      console.log("Listening on port " + listener.address().port);
    });
  })().catch(e => {
    console.log(e);
  });
})();

app.get("/products", products.getProducts);

app.get("/", function(request, response) {
  response.send({
    message: "hello world"
  });
});
