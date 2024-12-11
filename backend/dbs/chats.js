const { MongoClient } = require("mongodb")

const uri = process.env.CHATS_URI

let dbConnection

module.exports = {
  connectToChatsDb: (cb) => {
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
  getChatsDb: () => dbConnection,
}
