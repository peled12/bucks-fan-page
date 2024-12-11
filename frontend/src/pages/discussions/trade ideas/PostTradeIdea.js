import React, { useContext, useState } from "react"

import { IoMdClose } from "react-icons/io"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import "./tradeIdeas.css"

import { Context } from "../../../App"

const dbApiUrl = process.env.REACT_APP_API_URL

function PostTradeIdea() {
  const userName = useContext(Context)[2]

  const [teamsInvolved, setteamsInvolved] = useState([{ name: "Bucks" }])
  const [teamsInvolvedValue, setteamsInvolvedValue] = useState("")

  const [description, setdescription] = useState("")

  function checkValidPost() {
    let hasContent = true // side variable do invalidate the post by exiting the function

    teamsInvolved.map((team) => {
      if (
        team.get === undefined ||
        JSON.stringify(team.get) === JSON.stringify([""])
      ) {
        hasContent = false
        return
      }
    })
    if (!hasContent) {
      handleAnimation("Add some content...")
      return
    }

    if (teamsInvolved.length < 2) {
      handleAnimation("Include another team...")
      return
    }

    if (!description) {
      handleAnimation("Add some description...")
      return
    }

    // from here the post is valid

    const newArray = teamsInvolved.map(
      (team) => team.get.pop() // remove the last index
    )

    setteamsInvolved(newArray)

    postIdea()
  }

  function handleAnimation(msg) {
    const postMsg = document.querySelector(".post-msg")

    // remove the transition
    postMsg.style.transition = "none"
    postMsg.style.opacity = 1

    postMsg.textContent = msg

    void postMsg.offsetWidth

    // apply the transition
    postMsg.style.transition = "6s ease-in-out 2s"
    postMsg.style.opacity = 0
  }

  function postIdea() {
    const postMsg = document.querySelector(".post-msg")

    postMsg.textContent = "..."

    const currenDate = new Date()

    const currentSecond = currenDate.getSeconds()
    const currentMinute = currenDate.getMinutes()
    const currentHour = currenDate.getHours()
    const currentDay = currenDate.getDate()
    const currentMonth = currenDate.getMonth() + 1
    const currentYear = currenDate.getFullYear()
    const currentTime = currenDate.getTime()

    axios
      .post(dbApiUrl + "/tradeIdeas", {
        maker: userName,
        description: description.trim(),
        teams_involved: teamsInvolved,
        date: {
          second: currentSecond,
          minute: currentMinute,
          hour: currentHour,
          day: currentDay,
          month: currentMonth,
          year: currentYear,
          time: currentTime,
          fullDate: currentDay + "-" + currentMonth + "-" + currentYear,
        },
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        comments: [],
      })
      .then((res) => {
        cleanupPosting() // reset variables

        handleAnimation("Posted!")
      })
      .catch((err) => {
        console.error("Failed to post trade idea.", err.message)
        handleAnimation("Problem posting... please chaeck your internet")
      })

    function cleanupPosting() {
      setteamsInvolved([{ name: "Bucks" }])
      setdescription("")
      setteamsInvolvedValue("")
    }
  }

  function handleAddTeamInvolved(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (teamsInvolvedValue !== "" && teamsInvolved.length < 8) {
        setteamsInvolved((prev) => [
          ...prev,
          { name: teamsInvolvedValue.trim() },
        ])
        setteamsInvolvedValue("")
      }
    }
  }

  function handleTeamInvolvedChange(e) {
    if (teamsInvolved.length < 10) setteamsInvolvedValue(e.target.value)
  }

  function handleDescriptionChange(e) {
    setdescription(e.target.value)
  }

  function handleClearDescription() {
    setdescription("")
  }

  // the input of what teams recieve
  function handleGetChange(e, team) {
    const newArray = [...teamsInvolved]
    const index = newArray.findIndex((obj) => obj.name === team.name)

    if (!newArray[index].get) newArray[index].get = [e.target.value]

    const lastIndex = newArray[index].get.length - 1
    newArray[index].get[lastIndex] = e.target.value
  }

  // the submit when an asset is added
  function handleAddAsset(e, selectedTeam, selectedTeamIndex) {
    if (e.key === "Enter") {
      e.preventDefault()

      // dont allow empty inputs
      if (e.target.value === "") return

      // add a cap of max 5 assets for a team
      if (selectedTeam.get && selectedTeam.get.length >= 6) {
        alert("Max 5 players for each team.")

        // set the last asset to empty string

        const newArray = [...teamsInvolved]
        const prevTeam = newArray[selectedTeamIndex]

        const newGet = prevTeam.get
        newGet[newGet.length - 1] = ""
        const newTeam = {
          ...prevTeam,
          get: newGet,
        }

        newArray[selectedTeamIndex] = newTeam

        setteamsInvolved(newArray)

        return
      }

      const newArray = [...teamsInvolved]

      newArray.map((team) => {
        if (team.get && team.get.at(-1) !== "") team.get.push("") // push to every team that has something on the're input box
      })

      setteamsInvolved(newArray)

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })

      e.target.value = "" // clear the box
    }
  }

  function removeTeam(team) {
    const index = teamsInvolved.findIndex(
      (obj) => JSON.stringify(obj) === JSON.stringify(team)
    )

    const newArray = [...teamsInvolved]
    newArray.splice(index, 1)

    setteamsInvolved(newArray)
  }

  function removeAsset(team, asset) {
    const teamIndex = teamsInvolved.findIndex(
      (obj) => JSON.stringify(obj) === JSON.stringify(team)
    )
    const getIndex = team.get.findIndex((obj) => obj === asset)

    const newArray = [...teamsInvolved]
    newArray[teamIndex].get.splice(getIndex, 1)

    setteamsInvolved(newArray)
  }

  return (
    <div className="post-trade-idea">
      <h1 className="page-title">Trade Ideas</h1>
      <div className="start-container">
        <div className="text-container">
          <h2>Hi Bucks fan!</h2>
          <p>This is the place to suggest trade ideas for our team.</p>
          <p>
            Feel free to express anything you want, as long as you're respecting
            the rest of us fans.
          </p>
          <p>
            After you post your suggestion it will be available for everyone to
            see and comment on your idea.
          </p>
          <b>Thank You!</b>
        </div>
        <div className="post-description">
          <h2>Add Trade Description</h2>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Max 160 characters..."
            maxLength={160}
          />
          <button onClick={handleClearDescription} className="clear">
            CLR
          </button>
        </div>
      </div>
      <div className="teams-involved-container">
        <h2>Teams involved</h2>
        <input
          value={teamsInvolvedValue}
          onChange={handleTeamInvolvedChange}
          placeholder="Add team..."
          onKeyDown={handleAddTeamInvolved}
          maxLength={18}
        />
        <div className="teams">
          {teamsInvolved.map((team, index) => (
            <div className="team" key={uuidv4()}>
              <div className="team-title">
                <h3 style={team.name === "Bucks" ? { color: "#013101" } : {}}>
                  {team.name}
                </h3>
                <button
                  className="delete-team-btn"
                  onClick={() => removeTeam(team)}
                >
                  {team.name !== "Bucks" && <IoMdClose />}
                </button>
              </div>
              <input
                onChange={(e) => handleGetChange(e, team)}
                placeholder="Add assets..."
                maxLength={20}
                onKeyDown={(e) => handleAddAsset(e, team, index)}
              />
              <div className="asset-list">
                {team.get &&
                  team.get.map((asset, index) => (
                    <div className="asset" key={uuidv4()}>
                      <p>{asset}</p>
                      {index !== team.get.length - 1 && (
                        <button onClick={() => removeAsset(team, asset)}>
                          <IoMdClose className="del-asset" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="post-btn" onClick={checkValidPost}>
        Post
      </button>
      <div className="post-msg"></div>
    </div>
  )
}

export default PostTradeIdea
