const { MongoClient } = require("mongodb")

const uri = process.env.USERS_URI

let dbConnection

module.exports = {
  connectToUsersDb: (cb) => {
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
  getUsersDb: () => dbConnection,
}
