import React, { useContext, useState } from "react"

import { useNavigate } from "react-router-dom"

import "./userRoster.css"

import { GiCheckMark } from "react-icons/gi"

import sleep from "../../functions/sleep"

import coinIcon from "../../images/coin_icon.png"
import lineSeperator from "../../images/line_seperator.png"
import loadingImg from "../../images/loading_screen.png"

import RosterSpot from "../../components/userInputComponents/RosterSpot"

import { Context } from "../../App"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import { players, coaches } from "./AllMen"

const alts = ["PG", "SG", "SF", "PF", "C"]

const dbApiUrl = process.env.REACT_APP_API_URL

function UserRoster() {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const myUser = useContext(Context)[8]
  const setmyUser = useContext(Context)[9]

  const [displayingMen, setdisplayingMen] = useState("players")
  const [displayingMenArr, setdisplayingMenArr] = useState(players)

  const [showingMen, setshowingMen] = useState(true)
  const [showBought, setshowBought] = useState(false)

  const [selecting, setselecting] = useState(false)

  const navigate = useNavigate()

  function buyMan(man) {
    if (myUser.coins < man.cost) {
      alert(
        "You don't have enough coins to buy this " +
          (displayingMen === "player" ? "player" : "coach")
      )
      return
    }

    // start the animation
    const loader = document.querySelector(".user-roster-loader")
    loader.style.display = "block"

    let newMenBought
    let updates

    // make differnce between players and coaches
    if (displayingMen === "players") {
      newMenBought = [...myUser.roster.players_bought]
      newMenBought.push(man.name)

      updates = {
        roster: {
          ...myUser.roster,
          coins_spent: myUser.roster.coins_spent + man.cost,
          players_bought: newMenBought,
        },
        coins: myUser.coins - man.cost,
      }
    } else {
      newMenBought = [...myUser.roster.coaches_bought]
      newMenBought.push(man.name)

      updates = {
        roster: {
          ...myUser.roster,
          coins_spent: myUser.roster.coins_spent + man.cost,
          coaches_bought: newMenBought,
        },
        coins: myUser.coins - man.cost,
      }
    }

    const newMyUser = {
      ...myUser,
      roster: updates.roster,
      coins: updates.coins,
    }
    setmyUser(newMyUser)

    // patch
    axios
      .patch(dbApiUrl + "/users/user/" + username, updates)
      .then(async () => {
        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Failed updating roster.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  function sellMan(man) {
    let newMen
    let updates

    // start the animation
    const loader = document.querySelector(".user-roster-loader")
    loader.style.display = "block"

    if (displayingMen === "players") {
      newMen = [...myUser.roster.players]
      newMen[newMen.indexOf(man.name)] = ""

      const newPlayersBought = [...myUser.roster.players_bought].filter(
        (player) => player !== man.name
      )

      updates = {
        roster: {
          ...myUser.roster,
          coins_spent: myUser.roster.coins_spent - man.cost,
          players: newMen,
          players_bought: newPlayersBought,
        },
        coins: myUser.coins + man.cost / 2,
      }
    } else {
      newMen = [...myUser.roster.coaches]
      newMen[newMen.indexOf(man.name)] = ""

      const newCoachesBought = [...myUser.roster.coaches_bought].filter(
        (coach) => coach !== man.name
      )

      updates = {
        roster: {
          ...myUser.roster,
          coins_spent: myUser.roster.coins_spent - man.cost,
          coaches: newMen,
          coaches_bought: newCoachesBought,
        },
        coins: myUser.coins + man.cost / 2,
      }
    }

    const newMyUser = {
      ...myUser,
      roster: updates.roster,
      coins: updates.coins,
    }
    setmyUser(newMyUser)

    // patch
    axios
      .patch(dbApiUrl + "/users/user/" + username, updates)
      .then(async () => {
        // animation handling

        await sleep(150)

        loader.style.animationPlayState = "paused"
        loader.style.color = "green"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Failed updating roster.", err.message)

        // animation handling

        await sleep(150)

        loader.style.animationPlayState = "paused"
        loader.style.color = "red"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  function changeDisplayingMen() {
    let newDisplayingMen = displayingMen
    newDisplayingMen = displayingMen === "players" ? "coaches" : "players"

    setdisplayingMen(newDisplayingMen)

    setdisplayingMenArr(newDisplayingMen === "players" ? players : coaches)
  }

  function handleChangeSelecting(manName) {
    if (myUser.roster[displayingMen + "_bought"].includes(manName))
      setselecting(manName)
    else setselecting("")

    window.scrollTo({ top: 0 })

    const selectingElement = document.querySelector(".select-slot-msg")

    selectingElement.style.animation = // start the animation
      "selectSlotMsgAni 8s ease-in-out forwards"

    setTimeout(() => {
      selectingElement.style.animation = ""
      setselecting("")
    }, 8000)
  }

  function handleAddToRoster(place, index) {
    // in each roster there could be only one man of the same man
    if (selecting && myUser.roster[displayingMen].includes(selecting)) {
      setselecting("")
      return
    }

    // only put coaches in the coaches place and players in the players place
    if (
      (displayingMen === "players" && place === "coach") ||
      (displayingMen === "coaches" && place === "player")
    )
      return

    // dont add the man if his already there and hes not bought
    if (
      !selecting ||
      !myUser.roster[displayingMen + "_bought"].includes(selecting)
    )
      return

    // scroll to the top of the screen
    window.scrollTo({ top: 0, behavior: "smooth" })

    switch (place) {
      case "player":
        const newMyUser = { ...myUser }
        newMyUser.roster.players[index] = myUser.roster.players_bought.find(
          (player) => player === selecting
        )

        setmyUser(newMyUser)

        // update in the db:
        axios
          .patch(dbApiUrl + "/users/user/" + username, {
            roster: { ...newMyUser.roster },
          })
          .catch((err) => {
            console.error("Failed updating roster.", err.message)
          })
        break
      case "coach":
        const newUser = { ...myUser }
        newUser.roster.coaches[index] = myUser.roster.coaches_bought.find(
          (player) => player === selecting
        )

        setmyUser(newUser)

        // update in the db:
        axios
          .patch(dbApiUrl + "/users/user/" + username, {
            roster: { ...myUser.roster },
          })
          .catch((err) => {
            console.error("Failed updating roster.", err.message)
          })
    }

    setselecting("") // reset selecting
  }

  function handleRemoveFromRoster(manName, place) {
    if (selecting) return // dont execute this function if trying to select

    switch (place) {
      case "player":
        const newMyUser = { ...myUser }
        newMyUser.roster.players = [...myUser.roster.players].map((player) =>
          player === manName ? "" : player
        )

        setmyUser(newMyUser)

        // update in the db:
        axios
          .patch(dbApiUrl + "/users/user/" + username, {
            roster: { ...newMyUser.roster },
          })
          .catch((err) => {
            console.error("Failed updating roster.", err.message)
          })
        break
      case "coach":
        const newUser = { ...myUser }
        newMyUser.roster.coaches = [...myUser.roster.coaches].map((coach) =>
          coach === manName ? "" : coach
        )

        setmyUser(newUser)

        // update in the db:
        axios
          .patch(dbApiUrl + "/users/user/" + username, {
            roster: { ...myUser.roster },
          })
          .catch((err) => {
            console.error("Failed updating roster.", err.message)
          })
    }
  }

  function handleNavigateGuide() {
    navigate("/Guide", {
      state: { scrollDown: true },
    })
  }

  function handleChangeRosterVisibilty() {
    // start the animation
    const loader = document.querySelector(".user-roster-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/users/user/" + username, {
        roster: { ...myUser.roster, visible: !myUser.roster.visible },
      })
      .then(async () => {
        setmyUser((prev) => {
          return {
            ...prev,
            roster: { ...prev.roster, visible: !prev.roster.visible },
          }
        })

        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Couldn't change roster's visibility.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  return (
    <>
      <h1 className="page-title">Your Roster</h1>
      <p className="page-description">
        {isSignedIn
          ? "Earn coins by getting likes on any of your posts to create the best Bucks team possible!"
          : "You are not signed in."}
      </p>
      <p className="select-slot-msg">
        {selecting && "Select a slot for " + selecting.split(" ")[0] + "!"}
      </p>
      {myUser ? (
        <>
          <button
            className="leaderboard-visibilty"
            onClick={handleChangeRosterVisibilty}
          >
            {myUser.roster.visible ? "Hide" : "Show"} in leaderboard
          </button>
          <div className="loader4 user-roster-loader"></div>
          <div className="guide-btn-container">
            <p>Not sure how everything works?</p>
            <button onClick={handleNavigateGuide}>Click here</button>
          </div>
          <div
            className={
              "all-roster user-roster " + (selecting ? "selecting" : "")
            }
          >
            <div>
              {myUser.roster.players.slice(0, 5).map((name, index) => (
                <RosterSpot
                  key={uuidv4()}
                  man={players.find((player) => player.name === name)}
                  index={index}
                  addToRoster={handleAddToRoster}
                  removeFromRoster={handleRemoveFromRoster}
                  manType="player"
                  alt={alts[index]}
                />
              ))}
            </div>
            <div>
              {myUser.roster.players.slice(-8).map((name, index) => (
                <RosterSpot
                  key={uuidv4()}
                  man={players.find((player) => player.name === name)}
                  index={index + 5}
                  addToRoster={handleAddToRoster}
                  removeFromRoster={handleRemoveFromRoster}
                  manType="player"
                  alt=""
                />
              ))}
            </div>
            <div>
              {myUser.roster.coaches.map((name, index) => (
                <RosterSpot
                  key={uuidv4()}
                  man={coaches.find((player) => player.name === name)}
                  index={index}
                  addToRoster={handleAddToRoster}
                  removeFromRoster={handleRemoveFromRoster}
                  manType="coach"
                  alt={index === 0 ? "HC" : "AC"}
                />
              ))}
            </div>
          </div>
          <div className="filtering-btns">
            <button
              onClick={() => setshowingMen((prev) => !prev)}
              className={!showingMen ? "active" : ""}
            >
              Hide
            </button>
            <button
              onClick={() => setshowBought((prev) => !prev)}
              className={showBought ? "active" : ""}
            >
              Show Bought
            </button>
            <button
              onClick={changeDisplayingMen}
              className={displayingMen === "coaches" ? "active" : ""}
            >
              Show {displayingMen === "players" ? "coaches" : "players"}
            </button>
          </div>
          {showingMen && (
            <div className="men-cards">
              {displayingMenArr.map((man) => {
                if (
                  showBought &&
                  !myUser.roster[displayingMen].includes(man.name)
                )
                  return

                return (
                  <div key={uuidv4()} className="man">
                    <div className="man-display">
                      <div
                        className="image-container"
                        onClick={() => handleChangeSelecting(man.name)}
                        style={
                          myUser.roster[displayingMen + "_bought"].includes(
                            man.name
                          ) && !myUser.roster[displayingMen].includes(man.name)
                            ? { cursor: "pointer" }
                            : {}
                        }
                      >
                        <img
                          className="man-image"
                          src={man.img_url}
                          alt="image"
                        />
                      </div>
                      <img
                        className="line-seperator"
                        src={lineSeperator}
                        alt="line"
                      />
                      <div className="man-cost-container">
                        <span className="man-cost">
                          Cost: {man.cost}{" "}
                          {man.cost < 100 && <p style={{ opacity: "0" }}>1</p>}
                          <img
                            className="coin-icon"
                            alt="coins"
                            src={coinIcon}
                          />
                        </span>
                        {myUser.roster[displayingMen + "_bought"].includes(
                          man.name
                        ) ? (
                          <>
                            <button
                              className="buy-sell-btn"
                              onClick={() => sellMan(man)}
                            >
                              Sell for {man.cost / 2}
                            </button>
                            <div className="owned-icon-container">
                              <GiCheckMark className="owned-icon" />
                              <p>Owned</p>
                            </div>
                            <button
                              className="buy-sell-btn select-btn"
                              onClick={() => handleChangeSelecting(man.name)}
                            >
                              Select
                            </button>
                          </>
                        ) : (
                          <button
                            className="buy-sell-btn"
                            onClick={() => buyMan(man)}
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="man-name">{man.name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} alt="loading" />
          {isSignedIn ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>Oops. It seems like you're not signed in :(</p>
              <p>Sign in to view your roster!</p>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default UserRoster
