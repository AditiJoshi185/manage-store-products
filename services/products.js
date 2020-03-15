const Promise = require("bluebird");
const axios = require("axios");
const _ = require("underscore");

exports.storeProducts = storeProducts;
exports.getProducts = getProducts;

function storeProducts() {
  return Promise.coroutine(function*() {
    const STORE_URLS = [
      "https://www.allbirds.com/products.json",
      "https://millk.co/products.json",
      "https://www.fashionnova.com/products.json",
      "https://mnml.la/products.json"
    ];
    let storeAllBirdsProducts = yield axios.get(STORE_URLS[0]);
    let storeMilkProducts = yield axios.get(STORE_URLS[1]);
    let storeFashionnovaProducts = yield axios.get(STORE_URLS[2]);
    let storemnmlProducts = yield axios.get(STORE_URLS[3]);
    console.log(storeAllBirdsProducts, "storeAllBirdsProducts");
    if (!_.isEmpty(storeAllBirdsProducts.data)) {
      upsertInDb(STORE_URLS[0], storeAllBirdsProducts.data);
    }
    if (!_.isEmpty(storeMilkProducts.data)) {
      upsertInDb(STORE_URLS[1], storeMilkProducts.data);
    }
    if (!_.isEmpty(storeFashionnovaProducts.data)) {
      upsertInDb(STORE_URLS[2], storeFashionnovaProducts.data);
    }
    if (!_.isEmpty(storemnmlProducts.data)) {
      upsertInDb(STORE_URLS[3], storemnmlProducts.data);
    }
  })();
}

function upsertInDb(url, storeProducts) {
  storeProducts = storeProducts.products.slice(0, 100);
  storeProducts.forEach(products => {
    products.id = url + products.id;
    db.collection("products").update(
      { id: products.id },
      { $set: products },
      { upsert: true }
    );
  });
}

function getProducts(request, response) {
  return Promise.coroutine(function*() {
    let payload = request.query;
    console.log(payload, "payload");
    let productData = yield getDataFromMongo(payload);
    return response.send(productData);
  })();
}

function getDataFromMongo(opts) {
  return new Promise((res, rej) => {
    let { page, perPage, orderBy, orderDirection, search } = opts;
    perPage = perPage ? parseInt(perPage, 10) : 0;
    page = page ? parseInt(page, 10) : 0;
    let find = search ? { title: new RegExp(search, "i") } : {};
    var cursor = db.collection("products").find(find);
    if (orderBy) {
      let sort = {};
      orderDirection = orderDirection === "desc" ? -1 : 1;
      sort[orderBy] = orderDirection;
      cursor.sort(sort);
    }
    if (page && perPage) {
      let skip = page - 1 * perPage > 0 ? page - 1 * perPage : 0;
      cursor.skip(skip);
    }
    if (perPage) {
      cursor.limit(perPage);
    }
    cursor.toArray(function(err, docs) {
      if (err) {
        return rej(err);
      }
      console.log("Found the following records", docs);
      return res(docs);
    });
  });
}
