const { MongoClient } = require("mongodb")

const uri = process.env.TRADE_IDEAS_URI

let dbConnection

module.exports = {
  connectToTradeIdeasDb: (cb) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db()
        return cb()
      })
      .catch((err) => {
        console.error(err)
        return cb(err)
      })
  },
  getTradeIdeasDb: () => dbConnection,
}
