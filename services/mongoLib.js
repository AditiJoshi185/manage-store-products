const MongoClient = require("mongodb").MongoClient;
exports.connectMongo = connectMongo;
function connectMongo() {
  return new Promise((res, rej) => {
    // Connect to database
    const client = new MongoClient(process.env.MONGODB_URL, {
      useNewUrlParser: true
    });
    client.connect(err => {
      console.log("Connected successfully to database");
      db = client.db(process.env.DB_NAME);
      if (err) {
        console.log("Failed To Connect Mongo", err);
        return rej(err);
      }
      return res();
    });
  });
}
