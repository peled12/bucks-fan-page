// run this script manually once when every bucks game starts

require("dotenv").config()
const { MongoClient, ObjectId } = require("mongodb")

const client = new MongoClient(process.env.POLLS_URI)

async function adjustPolls() {
  try {
    await client.connect()

    const pollsDb = client.db("polls")

    const nextGameCon = pollsDb.collection("nextGame")
    const lastGameCon = pollsDb.collection("lastGame")

    const nextGame = await nextGameCon.findOne()

    lastGameCon.updateOne({}, { $set: nextGame }).then(() => {
      console.log("Last game polls adjusted!")
    }) // adjust lastGame

    // reset nextGame:
    const updatedNextGame = {
      _id: new ObjectId("65fc88454d0df9c6ced01f09"),
      q1: {
        option_1_votes: 0,
        all_voters: [],
        option_2_votes: 0,
        value: "Who will win this game?",
      },
      q2: {
        option_1_votes: 0,
        all_voters: [],
        option_2_votes: 0,
        option_3_votes: 0,
        option_4_votes: 0,
        value: "What's gonna be the point difference?",
      },
      q3: {
        option_1_votes: 0,
        option_2_votes: 0,
        option_3_votes: 0,
        option_4_votes: 0,
        value: "How many point will the Bucks take?",
        all_voters: [],
      },
      q4: {
        all_voters: [],
        option_1_votes: 0,
        option_2_votes: 0,
        option_3_votes: 0,
        option_4_votes: 0,
        value: "How many points will the Bucks score?",
      },
      q5: {
        all_voters: [],
        option_1_votes: 0,
        option_2_votes: 0,
        value: "Bucks will grab over/under 46.5 rebounds?",
      },
      q6: {
        all_voters: [],
        option_1_votes: 0,
        option_2_votes: 0,
        option_3_votes: 0,
        option_4_votes: 0,
        value: "How do you feel about this game?",
      },
    }

    nextGameCon.updateOne({}, { $set: updatedNextGame }).then(() => {
      console.log("Next game polls adjusted!")
    })
  } catch (err) {
    console.error(err)
  }
}

adjustPolls() // call the function
