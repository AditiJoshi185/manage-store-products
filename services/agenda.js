let Agenda = require("agenda");
const Promise = require("bluebird");

let products = require("./products");

let agenda = null;
function initializeAgenda() {
  return Promise.coroutine(function*() {
    agenda = new Agenda({
      db: { address: process.env.MONGODB_URL, collection: "scheduled" }
    });
    yield agenda._ready;
    defineStoreProductScheduled();
    yield agenda.start();
  })();
}

function defineStoreProductScheduled() {
  agenda.define("storeProducts", (job, done) => {
    products
      .storeProducts(job, done)
      .then(() => {
        done();
      })
      .catch(error => {
        done();
        console.log(error);
      });
  });
  agenda.every("1 hour", "storeProducts");
  return;
}

exports.initializeAgenda = initializeAgenda;
