const { MongoClient } = require("mongodb")

const uri = process.env.FANPOSTS_URI

let dbConnection

module.exports = {
  connectToFanpostsDb: (cb) => {
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
  getFanpostsDb: () => dbConnection,
}
