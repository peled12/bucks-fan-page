const { MongoClient } = require("mongodb")

const uri = process.env.POLLS_URI

let dbConnection

module.exports = {
  connectToPollsDb: (cb) => {
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
  getPollsDb: () => dbConnection,
}
