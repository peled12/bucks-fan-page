import React, { useContext, useState, useEffect } from "react"

import "./userRoster.css"

import { useNavigate, useLocation } from "react-router-dom"

import axios from "axios"

import loadingImg from "../../images/loading_screen.png"
import coinIcon from "../../images/coin_icon.png"
import trophy1 from "../../images/bucks/trophy1.png"
import trophy2 from "../../images/bucks/trophy2.png"
import trophy3 from "../../images/bucks/trophy3.png"
import defaultPFP from "../../images/default_user.png"

import { v4 as uuidv4 } from "uuid"

import { Context } from "../../App"

import RosterSpot from "../../components/userInputComponents/RosterSpot"

import { RxCross2 } from "react-icons/rx"

import { players, coaches } from "./AllMen"
import AddFriend from "../../components/discussionsComponents/AddFriend"
import RatingSlide from "../../components/homeComponents/RatingSlide"
import getColorOfRating from "../../functions/getColorOfValue"
import sleep from "../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

const alts = ["PG", "SG", "SF", "PF", "C"]

function Leaderboard() {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const navigate = useNavigate()

  const [leadingUsers, setleadingUsers] = useState(() => {
    const stored = localStorage.getItem("leaderboard")
    return stored ? JSON.parse(stored) : null
  })
  const [isError, setisError] = useState(false)

  const range = useLocation().pathname.split("/").at(-1)

  const [currentRating, setcurrentRating] = useState(0)
  const [ratingIndex, setratingIndex] = useState(null)

  useEffect(() => {
    const rangeSplit = range.split("-")

    // handle init fetching:
    if (rangeSplit[0] != 0) {
      navigate("/leaderboard/0-" + rangeSplit[1], { replace: true })

      queryFn("0-" + rangeSplit[1], false)
    } else if (!localStorage.getItem("leaderboard")) queryFn(range, false)
  }, [])

  function queryFn(usingRange, moreLoad) {
    let loader

    if (moreLoad) {
      loader = document.querySelector(".leaderboard-expand-loader")
      loader.style.display = "block" // start the animation
    }

    axios
      .get(dbApiUrl + "/leaderboard/" + usingRange)
      .then((res) => {
        setleadingUsers(moreLoad ? (prev) => prev.concat(res.data) : res.data)
        localStorage.setItem("leaderboard", JSON.stringify(res.data))

        if (loader) loader.style.display = "none" // end the animation
      })
      .catch((err) => {
        console.error("Failed getting leaderboard.", err.message)
        setisError(true)

        if (loader) loader.style.display = "none" // end the animation
      })
  }

  function handleRateRoster(index) {
    if (!isSignedIn) {
      alert("You must be signed in to rate this roster.")
      navigate("/SignIn")
      return
    }

    const maker = leadingUsers[index]

    const loader = document.querySelector(".leaderboard-loader")

    loader.style.display = "block" // start the animation

    const newRating = [...maker.roster.rating]

    let ratingIndex

    // if already voted
    if (
      newRating.some((rating, i) => {
        if (rating.rater === username) {
          ratingIndex = i
          return true
        }
      })
    )
      newRating[ratingIndex].rate = currentRating
    else newRating.push({ rater: username, rate: currentRating }) // else

    axios
      .patch(dbApiUrl + "/users/user/" + maker.userName, {
        roster: { ...maker.roster, rating: newRating },
      })
      .then(async () => {
        const newUser = {
          ...maker,
          roster: { ...maker.roster, rating: newRating },
        }

        const newArray = [...leadingUsers]
        newArray[index] = newUser

        setleadingUsers(newArray)

        localStorage.setItem("leaderboard", JSON.stringify(newArray))

        // animation handling

        await sleep(150)

        document.querySelector(".rate-container").style.display = "none"

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Failed rating roster.", err.message)

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

  function getRatingAvg(array, onlyNumber) {
    if (!array.length && onlyNumber) return 0

    if (!array.length) return "?"

    const sum = array.reduce((total, obj) => {
      return total + obj.rate
    }, 0)

    return (sum / array.length).toFixed(1)
  }

  function handleChangeSort(e) {
    switch (e.target.value) {
      case "coins spent":
        setleadingUsers((prev) =>
          [...prev].sort((a, b) => b.roster.coins_spent - a.roster.coins_spent)
        )
        break
      case "coins":
        setleadingUsers((prev) => [...prev].sort((a, b) => b.coins - a.coins))
        break
      case "rating":
        setleadingUsers((prev) =>
          [...prev].sort(
            (a, b) =>
              getRatingAvg(b.roster.rating, true) -
              getRatingAvg(a.roster.rating, true)
          )
        )
        break
    }
  }

  function expandLeaderboard() {
    const currentRange = range.split("-")

    // expand 5 more players
    const newRange =
      (+currentRange[0] + 5).toString() +
      "-" +
      (+currentRange[1] + 5).toString()

    navigate("/leaderboard/" + newRange, { replace: true }) // change the path name

    queryFn(newRange, true) // fetch
  }

  function handleShowRate(index) {
    setratingIndex(index)
    setcurrentRating(5)

    document.querySelector(".rate-container").style.display = "flex"
  }

  function handleHideRate() {
    setratingIndex(null)
    setcurrentRating(5)

    document.querySelector(".rate-container").style.display = "none"
  }

  // effect for the removal of the rate container after a background click
  useEffect(() => {
    function handleClick(e) {
      if (
        !e.target.closest(".rate-container") &&
        !e.target.classList.value.includes("rate-btn")
      ) {
        setratingIndex(null)
        setcurrentRating(5)

        document.querySelector(".rate-container").style.display = "none"
      }
    }

    window.addEventListener("click", handleClick)

    return () => window.removeEventListener("click", handleClick)
  }, [])

  return (
    <div className="leaderboard-page">
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-description">The leaderboard out of all our users!</p>
      <div className="loader4 leaderboard-loader"></div>
      <div className="leaderboard-sort-container">
        <p>Sort by:</p>
        <select className="leaderboard-sort" onChange={handleChangeSort}>
          <option value="coins spent">Coins spent</option>
          <option value="coins">Available coins</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="leaderboard">
        {leadingUsers && (
          <div className="rate-container">
            <RxCross2 onClick={handleHideRate} />
            <div className="in-container">
              <p
                className="number"
                style={{
                  boxShadow: "0 0 13px 3px " + getColorOfRating(currentRating),
                }}
              >
                {currentRating}
              </p>
              <button
                className="rate-roster-btn"
                onClick={() => handleRateRoster(ratingIndex)}
              >
                Submit
              </button>
            </div>
            <RatingSlide setValue={setcurrentRating} />
          </div>
        )}
        {leadingUsers ? (
          leadingUsers.map((user, index) => (
            <div key={uuidv4()} style={{ position: "relative", margin: 0 }}>
              <div
                className={"user " + (index % 2 === 0 ? "even" : "odd")}
                style={
                  index === leadingUsers.length - 1 ? { border: "none" } : {}
                }
              >
                <div className="user-left">
                  {index === 0 && <img src={trophy1} className="trophy-img" />}
                  {index === 1 && <img src={trophy2} className="trophy-img" />}
                  {index === 2 && <img src={trophy3} className="trophy-img" />}

                  <h2
                    className="username"
                    style={
                      user.userName === username ||
                      user.roster.rating.some(
                        (rating) => rating.rater === username
                      )
                        ? { marginBottom: "20%" }
                        : {}
                    }
                  >
                    <AddFriend
                      name={user.userName}
                      className="normal"
                      addition="'s"
                    />
                    <span> roster</span>
                  </h2>

                  <div className="in-container">
                    <img
                      src={user.profile_pic_url || defaultPFP}
                      className="profile-pic"
                    />
                    <div className="user-text">
                      <div
                        className="user-info"
                        style={
                          user.userName === username ||
                          user.roster.rating.some(
                            (rating) => rating.rater === username
                          )
                            ? { justifyContent: "center", marginRight: "0" }
                            : {}
                        }
                      >
                        <div
                          className="part1"
                          style={
                            user.userName === username ||
                            user.roster.rating.some(
                              (rating) => rating.rater === username
                            )
                              ? { alignItems: "center" }
                              : {}
                          }
                        >
                          <span>Available coins: {user.coins}</span>
                          <div className="coins-spent-container">
                            <p>Coins spent: {user.roster.coins_spent}</p>
                            <img className="coin-icon" src={coinIcon} />
                          </div>
                          <div className="in">
                            {user.roster.rating.length ? (
                              <span>
                                Avarage rating:{" "}
                                <b>{getRatingAvg(user.roster.rating)}</b>
                              </span>
                            ) : (
                              <b>No rates yet</b>
                            )}
                            {user.userName !== username &&
                              (!user.roster.rating.some(
                                (rating) => rating.rater === username
                              ) ? (
                                <button
                                  className="rate-btn"
                                  onClick={() => handleShowRate(index)}
                                >
                                  RATE
                                </button>
                              ) : (
                                <button
                                  className="rate-btn"
                                  onClick={() => handleShowRate(index)}
                                >
                                  RERATE
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="all-roster">
                  <div>
                    {user.roster.players.slice(0, 5).map((name, index) => (
                      <RosterSpot
                        key={uuidv4()}
                        man={players.find((player) => player.name === name)}
                        index={index}
                        addToRoster={() => ""}
                        manType="player"
                        alt={alts[index]}
                      />
                    ))}
                  </div>
                  <div>
                    {user.roster.players.slice(-8, -4).map((name, index) => (
                      <RosterSpot
                        key={uuidv4()}
                        man={players.find((player) => player.name === name)}
                        index={index}
                        addToRoster={() => ""}
                        manType="player"
                        alt=""
                      />
                    ))}
                  </div>
                  <div>
                    {user.roster.players.slice(-4).map((name, index) => (
                      <RosterSpot
                        key={uuidv4()}
                        man={players.find((player) => player.name === name)}
                        index={index}
                        addToRoster={() => ""}
                        manType="player"
                        alt=""
                      />
                    ))}
                  </div>
                  <div>
                    {user.roster.coaches.map((name, index) => (
                      <RosterSpot
                        key={uuidv4()}
                        man={coaches.find((player) => player.name === name)}
                        index={index}
                        addToRoster={() => ""}
                        manType="player"
                        alt={index === 0 ? "HC" : "AC"}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="loading-container">
            <img src={loadingImg} />
            {isError ? (
              <p>It looks like we have a problem. try again later!</p>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        )}
      </div>
      {leadingUsers && leadingUsers.length == range.split("-")[1] && (
        <button className="expand-btn" onClick={expandLeaderboard}>
          EXPAND
        </button>
      )}
      <div className="loader4 leaderboard-expand-loader"></div>
    </div>
  )
}

export default Leaderboard
