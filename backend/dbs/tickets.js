const { MongoClient } = require("mongodb")

const uri = process.env.TICKETS_URI

let dbConnection

module.exports = {
  connectToTicketsDb: (cb) => {
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
  getTicketsDb: () => dbConnection,
}
