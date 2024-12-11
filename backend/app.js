const express = require("express")
require("dotenv").config()
const cors = require("cors")
const bodyParser = require("body-parser")
const { connectToUsersDb, getUsersDb } = require("./dbs/users")
const { connectToTradeIdeasDb, getTradeIdeasDb } = require("./dbs/tradeIdeas")
const { connectToFanpostsDb, getFanpostsDb } = require("./dbs/fanposts")
const { connectToPollsDb, getPollsDb } = require("./dbs/polls")
const { connectToChatsDb, getChatsDb } = require("./dbs/chats")
const { connectToTicketsDb, getTicketsDb } = require("./dbs/tickets")
const { ObjectId } = require("mongodb")

const socketIO = require("socket.io")
const http = require("http")

const bcrypt = require("bcrypt")

// init app & middleware

const app = express()
app.use(express.json())
app.use(bodyParser.json())

const server = http.createServer(app)
const io = socketIO(server, {
  cors: { origin: ["http://localhost:3000"] },
})

const users = {} // object to store all active users

io.on("connection", (socket) => {
  socket.on("login", (username) => {
    users[username] = socket.id // store the user's socket id
    console.log(`${username} connected: ${socket.id}`)
  })

  // handle direct messages
  socket.on("message", ({ recipient, msgObj }) => {
    const recipientSocketId = users[recipient] // get recipient's socket id
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", msgObj) // send message to the reciepient
    } else {
      console.log(`user ${recipient} is not connected`)
    }
  })

  // handle reading messages
  socket.on("read", ({ recipient, personRead }) => {
    const recipientSocketId = users[recipient] // get recipient's socket id
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("read", personRead) // send message to the reciepient
    } else {
      console.log(`user ${recipient} is not connected`)
    }
  })

  socket.on("disconnect", () => {
    // remove the disconnected user from the users object
    for (const username in users) {
      if (users[username] === socket.id) {
        delete users[username]
        console.log(`${username} disconnected: ${socket.id}`)
        break
      }
    }
  })
})

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: "GET, POST, PATCH, DELETE, PUT",
  allowedHeaders: "Content-Type, Authorization",
}

app.use(cors(corsOptions))

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log("server listening on port " + PORT)
})

// routes

// log in validation
app.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body

  try {
    const user = await usersDb.collection("users").findOne({
      $or: [{ userName: usernameOrEmail }, { email: usernameOrEmail }],
    })

    // invalid username or email
    if (!user)
      return res.status(401).json({ message: "Invalid username or email." })

    // check password
    const isMatch = await bcrypt.compare(password, user.password)

    // invalid password
    if (!isMatch) return res.status(401).json({ message: "Invalid password." })

    // successful login
    res.json({
      username: user.userName,
      email: user.email,
      password: password,
    })
  } catch (err) {
    console.error("error during login: " + err)
    res.status(500).json({ message: "Internal server error." })
  }
})

// sign up validation
app.post("/signUpCheck", async (req, res) => {
  const { email, username } = req.body

  try {
    const usersArray = await usersDb.collection("users").find({}).toArray()

    let emailExists = false
    let userNameExists = false

    console.log(usersArray)

    // Loop through the users array and check for matches
    for (const user of usersArray) {
      if (!emailExists) emailExists = user.email === email
      if (!userNameExists) userNameExists = user.userName === username

      if (emailExists && userNameExists) break // Exit loop early if both found
    }

    // return the appropriate response
    if (emailExists && userNameExists) {
      return res.status(401).json({ message: "email username" }) // both exist
    }

    if (emailExists) {
      return res.status(401).json({ message: "email" }) // only email exists
    }

    if (userNameExists) {
      return res.status(401).json({ message: "username" }) // only username exists
    }

    res.json(200) // successful check
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Internal server error." })
  }
})

// find user with email for the forgot password logic
app.get("/users/findWithEmail/:email", (req, res) => {
  const email = req.params.email

  usersDb
    .collection("users")
    .findOne({ email: email })
    .then((result) => {
      if (!result) {
        // email not found
        return res.status(404).json({ message: "Email not found." })
      }
      res.status(200).json({
        username: result.userName,
        email: result.email,
        id: result._id,
      }) // email found
    })
    .catch(() => {
      res.status(500).json({ err: "Internal server error" })
    })
})

// create user
app.post("/signUp", (req, res) => {
  const user = req.body

  // hash the password before saving the user
  bcrypt
    .hash(user.password, 10)
    .then((hashedPassword) => {
      // replace the password with the new hashed one
      user.password = hashedPassword

      // insert the user into the database
      return usersDb.collection("users").insertOne(user)
    })
    .then((result) => {
      res.status(201).json(result)
    })
    .catch((error) => {
      console.error("Error creating user:", error)
      res.status(500).json({ err: "could not create the new document" })
    })
})

// tickets connection:

let ticketsDb

connectToTicketsDb((err) => {
  if (!err) {
    ticketsDb = getTicketsDb()
  } else {
    console.error(err)
  }
})

app.delete("/tickets/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const ticketId = new ObjectId(req.params.id)

    ticketsDb
      .collection("tickets")
      .deleteOne({ _id: ticketId })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not delete the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.get("/tickets/:currentDateTime", (req, res) => {
  // only get the tickets whos date is after now

  const currentDateTime = parseInt(req.params.currentDateTime)

  // current page

  ticketsDb
    .collection("tickets")
    .find({ game_date: { $gt: currentDateTime } })
    .sort({ date: -1 })
    .toArray()
    .then((upToDateTickets) => {
      res.status(200).json(upToDateTickets)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

app.post("/tickets", (req, res) => {
  const ticket = req.body

  ticketsDb
    .collection("tickets")
    .insertOne(ticket)
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not create the new document" })
    })
})

app.patch("/tickets/:id", (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {
    const ticketId = new ObjectId(req.params.id)

    ticketsDb
      .collection("tickets")
      .updateOne({ _id: ticketId }, { $set: updates })
      .then((result) => {
        if (result.modifiedCount === 0) {
          // no document was found or updated
          res.status(404).json({ err: "no ticket found with that id" })
        } else {
          res.status(200).json(result)
        }
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

// chats connection:

let chatsDb

connectToChatsDb((err) => {
  if (!err) {
    chatsDb = getChatsDb()
  } else {
    console.error(err)
  }
})

app.get("/chats", (req, res) => {
  // current page

  let chats = []

  chatsDb
    .collection("chats")
    .find()
    .sort({ date: 1 })
    .forEach((chat) => chats.push(chat))
    .then(() => {
      res.status(200).json(chats)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

// get user's chats:
app.get("/chats/:username", (req, res) => {
  let userChats = []

  const username = req.params.username.trim()

  chatsDb
    .collection("chats")
    .find()
    .forEach((chat) => {
      if (chat.chatters.includes(username)) userChats.push(chat)
    })
    .then(() => {
      res.status(200).json(userChats)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

app.get("/chats/one/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const chatId = new ObjectId(req.params.id)

    chatsDb
      .collection("chats")
      .findOne({ _id: chatId })
      .then((doc) => {
        res.status(200).json(doc)
      })
      .catch(() => {
        res.status(500).json({ err: "could not fetch the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.put("/chats/:id", (req, res) => {
  const doc = req.body
  const { _id, ...newDoc } = doc

  if (ObjectId.isValid(_id)) {
    const chatId = new ObjectId(_id)

    chatsDb
      .collection("chats")
      .updateOne({ _id: chatId }, { $set: newDoc })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else {
    res.status(500).json({ err: "invalid id" })
  }
})

app.patch("/chats/:id", (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {
    const ticketId = new ObjectId(req.params.id)

    chatsDb
      .collection("chats")
      .updateOne({ _id: ticketId }, { $set: updates })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.post("/chats", (req, res) => {
  const msg = req.body

  chatsDb
    .collection("chats")
    .insertOne(msg)
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not create the new document" })
    })
})

app.delete("/chats/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const chatId = new ObjectId(req.params.id)

    chatsDb
      .collection("chats")
      .deleteOne({ _id: chatId })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not delete the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

// polls connection:
let pollsDb

connectToPollsDb((err) => {
  if (!err) {
    pollsDb = getPollsDb()
  } else {
    console.error(err)
  }
})

// last game rating:

app.get("/polls/lastGamesRating", (req, res) => {
  pollsDb
    .collection("lastGameRating")
    .findOne({})
    .then((document) => {
      if (document) {
        res.status(200).json(document)
      } else {
        res.status(404).json({ err: "document not found" })
      }
    })
    .catch(() => {
      res.status(500).json({ err: "error finding the document" })
    })
})

app.patch("/polls/lastGamesRating", (req, res) => {
  const updates = req.body

  pollsDb
    .collection("lastGameRating")
    .updateOne({}, { $set: updates })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not update the document" })
    })
})

app.get("/polls/nextGame", (req, res) => {
  pollsDb
    .collection("nextGame")
    .findOne({})
    .then((document) => {
      if (document) {
        res.status(200).json(document)
      } else {
        res.status(404).json({ err: "document not found" })
      }
    })
    .catch(() => {
      res.status(500).json({ err: "error finding the document" })
    })
})

app.patch("/polls/nextGame", (req, res) => {
  const updates = req.body

  pollsDb
    .collection("nextGame")
    .updateOne({}, { $set: updates })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not update the document" })
    })
})

app.get("/polls/lastGame", (req, res) => {
  pollsDb
    .collection("lastGame")
    .findOne({})
    .then((document) => {
      if (document) {
        res.status(200).json(document)
      } else {
        res.status(404).json({ err: "document not found" })
      }
    })
    .catch(() => {
      res.status(500).json({ err: "error finding the document" })
    })
})

app.patch("/polls/lastGame", (req, res) => {
  const updates = req.body

  pollsDb
    .collection("lastGame")
    .updateOne({}, { $set: updates })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not update the document" })
    })
})

// fanposts connection
let fanpostsDb

connectToFanpostsDb((err) => {
  if (!err) {
    fanpostsDb = getFanpostsDb()
  } else {
    console.error(err)
  }
})

app.get("/fanposts", (req, res) => {
  // current page

  let fanposts = []

  fanpostsDb
    .collection("fanposts")
    .find()
    .sort({ date: -1 })
    .forEach((fanpost) => fanposts.push(fanpost))
    .then(() => {
      res.status(200).json(fanposts)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

// get a user's fanposts:
app.get("/fanposts/:username", (req, res) => {
  // current page

  let userFanposts = []

  const username = req.params.username

  fanpostsDb
    .collection("fanposts")
    .find({ maker: username })
    .sort({ date: 1 })
    .forEach((fanpost) => userFanposts.push(fanpost))
    .then(() => {
      res.status(200).json(userFanposts)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

app.patch("/fanposts/:id", (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {
    const fanpostId = new ObjectId(req.params.id)

    fanpostsDb
      .collection("fanposts")
      .updateOne({ _id: fanpostId }, { $set: updates })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.post("/fanposts", (req, res) => {
  const post = req.body

  fanpostsDb
    .collection("fanposts")
    .insertOne(post)
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not create the new document" })
    })
})

app.delete("/fanposts/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const fanpostId = new ObjectId(req.params.id)

    fanpostsDb
      .collection("fanposts")
      .deleteOne({ _id: fanpostId })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not delete the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

// tradeposts connection
let tradeIdeasDb

connectToTradeIdeasDb((err) => {
  if (!err) {
    tradeIdeasDb = getTradeIdeasDb()
  } else {
    console.error(err)
  }
})

app.get("/tradeIdeas", (req, res) => {
  // current page

  let tradeIdeas = []

  tradeIdeasDb
    .collection("tradeIdeas")
    .find()
    .sort({ date: 1 })
    .forEach((tradeIdea) => tradeIdeas.push(tradeIdea))
    .then(() => {
      res.status(200).json(tradeIdeas)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

// get a user's trade ideas:
app.get("/tradeIdeas/:username", (req, res) => {
  // current page

  let userTradeIdeas = []

  const username = req.params.username

  tradeIdeasDb
    .collection("tradeIdeas")
    .find({ maker: username })
    .sort({ date: 1 })
    .forEach((fanpost) => userTradeIdeas.push(fanpost))
    .then(() => {
      res.status(200).json(userTradeIdeas)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

app.patch("/tradeIdeas/:id", (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {
    const tradeIdeaId = new ObjectId(req.params.id)

    tradeIdeasDb
      .collection("tradeIdeas")
      .updateOne({ _id: tradeIdeaId }, { $set: updates })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.post("/tradeIdeas", (req, res) => {
  const idea = req.body

  tradeIdeasDb
    .collection("tradeIdeas")
    .insertOne(idea)
    .then((result) => {
      res.status(201).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not create the new document" })
    })
})

app.delete("/tradeIdeas/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const tradeIdeaId = new ObjectId(req.params.id)

    tradeIdeasDb
      .collection("tradeIdeas")
      .deleteOne({ _id: tradeIdeaId })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not delete the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

// users connection
let usersDb

connectToUsersDb((err) => {
  if (!err) {
    usersDb = getUsersDb()
  } else {
    console.error(err)
  }
})

app.get("/users", (req, res) => {
  // current page

  let users = []

  usersDb
    .collection("users")
    .find()
    .sort({ userName: 1 })
    .forEach((user) => users.push(user))
    .then(() => {
      res.status(200).json(users)
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch the documents" })
    })
})

app.get("/users/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const userId = new ObjectId(req.params.id)

    usersDb
      .collection("users")
      .findOne({ _id: userId })
      .then((doc) => {
        res.status(200).json(doc)
      })
      .catch(() => {
        res.status(500).json({ err: "could not fetch the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.delete("/users/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const userId = new ObjectId(req.params.id)

    usersDb
      .collection("users")
      .deleteOne({ _id: userId })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not delete the document" })
      })
  } else res.status(500).json({ err: "invalid id" })
})

app.patch("/users/:id", (req, res) => {
  const updates = req.body

  if (ObjectId.isValid(req.params.id)) {
    const userId = new ObjectId(req.params.id)

    // if the password is being updated, update the user with a hashed password
    if (updates.password) {
      bcrypt
        .hash(updates.password, 10)
        .then((hashedPassword) => {
          updates.password = hashedPassword

          return usersDb
            .collection("users")
            .updateOne({ _id: userId }, { $set: updates })
        })
        .then((result) => {
          res.status(200).json(result)
        })
        .catch(() => {
          res.status(500).json({ err: "could not update the document" })
        })
    } else {
      // password doesnt change, update normally
      usersDb
        .collection("users")
        .updateOne({ _id: userId }, { $set: updates })
        .then((result) => {
          res.status(200).json(result)
        })
        .catch(() => {
          res.status(500).json({ err: "could not update the document" })
        })
    }
  } else {
    res.status(400).json({ err: "invalid id" })
  }
})

app.get("/users/user/:username", (req, res) => {
  const username = req.params.username

  usersDb
    .collection("users")
    .findOne({ userName: username })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not update the document" })
    })
})

app.post("/users/acceptFriend", async (req, res) => {
  const { accepter, requester } = req.body

  try {
    await usersDb.collection("users").bulkWrite([
      {
        updateOne: {
          filter: { userName: accepter }, // find the accepter
          update: {
            $addToSet: { friends: requester }, // add the requester to the accpeters friends
            $pull: { friend_requests: requester }, // remove the requester from the accepter's request list
          },
        },
      },
      {
        updateOne: {
          filter: { userName: requester }, // find the requester
          update: {
            $addToSet: { friends: accepter }, // add the accepter the the requester's friends
          },
        },
      },
    ])

    res.status(200).send({
      message: "users are now friends",
    })
  } catch (err) {
    console.error("error updating users:", err)
    res.status(500).send({ message: "failed to update users" })
  }
})

app.post("/users/denyFriend", async (req, res) => {
  const { denyer, requester } = req.body

  try {
    await usersDb.collection("users").updateOne(
      {
        userName: denyer,
      },
      { $pull: { friend_requests: requester } }
    )

    res.status(200).send({ message: "friend request denied" })
  } catch (err) {
    console.error("erro denying friendship:", err)
    res.status(500).send({ message: "failed to deny friendship" })
  }
})

app.post("/users/sendFriendRequest", async (req, res) => {
  const { getter, sender } = req.body

  try {
    // find the user who is receiving the friend request
    const getterUser = await usersDb
      .collection("users")
      .findOne({ userName: getter })

    // check if the user exists
    if (!getterUser) {
      return res.status(404).json({ message: "User not found." })
    }

    // check if the friend request already exists
    if (getterUser.friend_requests.includes(sender)) {
      return res.status(400).json({ message: "Friend request already sent." })
    }

    // update getterUser
    await usersDb
      .collection("users")
      .updateOne({ userName: getter }, { $push: { friend_requests: sender } })

    res.status(200) // successful request
  } catch (error) {
    console.error("error sending friend request:", error)
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." })
  }
})

app.patch("/users/changeCoins/:username", (req, res) => {
  const username = req.params.username
  const { addingNumber } = req.body

  usersDb
    .collection("users")
    .updateOne({ userName: username }, { $inc: { coins: addingNumber } })
    .then((result) => {
      if (result.modifiedCount > 0) {
        res.status(200).send({ message: "coins changed successfully" })
      } else {
        res.status(404).send({ message: "user not found" })
      }
    })
    .catch((error) => {
      console.error("error changing coins:", error)
      res.status(500).send({ message: "failed to change coins" })
    })
})

app.patch("/users/user/:username", (req, res) => {
  const updates = req.body

  const username = req.params.username

  // if the password is present, then its changing, so re-hash it
  if (updates.password) {
    bcrypt
      .hash(updates.password, 10)
      .then((hashedPassword) => {
        // re-hash the password
        updates.password = hashedPassword
        return usersDb
          .collection("users")
          .updateOne({ userName: username }, { $set: updates })
      })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  } else {
    // if the password is not changing, update normally
    usersDb
      .collection("users")
      .updateOne({ userName: username }, { $set: updates })
      .then((result) => {
        res.status(200).json(result)
      })
      .catch(() => {
        res.status(500).json({ err: "could not update the document" })
      })
  }
})

app.put("/users/user/:username", (req, res) => {
  const newDoc = req.body
  const username = req.params.username

  delete newDoc._id // dont change the immutable prop _id

  usersDb
    .collection("users")
    .updateOne({ userName: username }, { $set: newDoc })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500).json({ err: "could not update the document" })
    })
})

// leaderboard
app.get("/leaderboard/:range", (req, res) => {
  const range = req.params.range

  const [minRange, maxRange] = range.split("-").map(Number) // convert strings to numbers

  let users = []

  usersDb
    .collection("users")
    .find({ "roster.visible": true })
    .sort({ "roster.coins_spent": -1 }) // sort in descending order of coins_spent.skip(minRange)
    .skip(minRange) // skip the first 'minRange' documents
    .limit(maxRange - minRange) // limit to 'maxRange - minRange' documents
    .toArray() // ocnvert the cursor to an array
    .then((result) => {
      users = result // assign the result to the 'users' array
      res.status(200).json(users)
    })
    .catch(() => {
      res.status(500).json({ err: "could not fetch the document" })
    })
})
