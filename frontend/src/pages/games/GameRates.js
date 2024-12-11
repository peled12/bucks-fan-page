import React, { useEffect, useContext, useState } from "react"

import { useNavigate } from "react-router-dom"

import "./games.css"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import getColorOfRating from "../../functions/getColorOfValue"
import isUpToAWeekBefore from "../../functions/isUpToAWeekBefore"
import formatGameDateString from "../../functions/formatGameDateString"
import sleep from "../../functions/sleep"

import { BiLike } from "react-icons/bi"
import { BiSolidLike } from "react-icons/bi"

import loadingImg from "../../images/loading_screen.png"

import { useLocation } from "react-router-dom"
import AddFriend from "../../components/discussionsComponents/AddFriend"

import { Context } from "../../App"

const dbApiUrl = process.env.REACT_APP_API_URL

function GameRates({ lastGameRatings, status, teams }) {
  const username = useContext(Context)[2]

  const [lastWeekGameRatings, setlastWeekGameRatings] = useState(null)
  const [averageLastWeekRating, setaverageLastWeekRating] = useState(null)

  useEffect(() => {
    if (lastGameRatings) {
      const firstNonLastWeekgameIndex = lastGameRatings.rates.findIndex(
        (rate) =>
          !isUpToAWeekBefore(formatGameDateString(rate.gameID.split("_")[0]))
      )

      const lastWeekRatingArr =
        firstNonLastWeekgameIndex === -1
          ? lastGameRatings.rates
          : lastGameRatings.rates.slice(0, firstNonLastWeekgameIndex)

      setlastWeekGameRatings(lastWeekRatingArr)

      const average =
        // get the sum
        lastWeekRatingArr.reduce(
          (currentSum, obj) => currentSum + obj.rating,
          0
        ) / lastWeekRatingArr.length // divide by length

      setaverageLastWeekRating(average.toFixed(2))
    }
  }, [lastGameRatings])

  const navigate = useNavigate()

  const location = useLocation()
  const clickedRateID = location.state && location.state.rateID

  useEffect(() => {
    const clickedRating = document.querySelector("." + clickedRateID)

    if (clickedRating) {
      clickedRating.scrollTo({ behavior: "smooth" })

      // mark this rating for a small time
      const currentColor = clickedRating.style.backgroundColor
      clickedRating.style.backgroundColor = "#acacac"
      setTimeout(
        () => (clickedRating.style.backgroundColor = currentColor),
        800
      )
    }
  }, [])

  function handleNavigate(e, gameID) {
    // only if its not the likes container or the name container
    if (
      !e.target.closest(".like-container") &&
      !e.target.closest(".name-container")
    )
      navigate("/GameRecap/" + gameID)
  }

  function handleLikeRate(operation, index) {
    // would automatticaly delete rates not from the past week after a like or unlike
    let newRates = [...lastWeekGameRatings]

    if (operation === "like") newRates[index].liked_by.push(username)
    else
      newRates[index].liked_by = newRates[index].liked_by.filter(
        (name) => name !== username
      )

    // start the animation
    const loader = document.querySelector(".game-rates-loader")
    loader.style.display = "block"

    // patch
    axios
      .patch(dbApiUrl + "/polls/lastGamesRating", {
        rates: newRates,
      })
      .then(async () => {
        setlastWeekGameRatings(newRates)

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
        console.error("Failed to patch last games rating.", err.message)

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
      <h1 className="page-title">Game Rates</h1>
      <p className="page-description">
        All ratings from Bucks fans from games of the past week
      </p>
      {averageLastWeekRating && (
        <p className="average-last-week-rating">
          Last week's average rating: <b>{averageLastWeekRating}</b>
        </p>
      )}
      <div className="loader4 game-rates-loader"></div>
      <div
        className="last-week-ratings"
        style={
          lastWeekGameRatings && !lastWeekGameRatings.length
            ? { border: "none" }
            : {}
        }
      >
        {lastWeekGameRatings ? (
          lastWeekGameRatings.length ? (
            <>
              <div className="title-container">
                <p className="name-title">Name</p>
                <p className="game-title">Game</p>
                <p className="description-title">Description</p>
                <p className="rating-title">Rating</p>
              </div>
              {lastWeekGameRatings.map((rate, index) => (
                <div
                  key={uuidv4()}
                  className={
                    "last-week-rate " +
                    (rate.username +
                      "_" +
                      rate.gameID.replace(/@/g, "") +
                      " ") +
                    (index % 2 === 0 ? "even " : "") +
                    (index === lastWeekGameRatings.length - 1 ? "last" : "")
                  }
                  onClick={(e) => handleNavigate(e, rate.gameID)}
                >
                  <span className="name-container">
                    <AddFriend name={rate.username} className="normal" />
                  </span>
                  <div className="teams-container">
                    <img
                      src={
                        teams.find(
                          (team) =>
                            team.teamAbv ===
                            rate.gameID.split("_")[1].split("@")[1]
                        ).nbaComLogo1
                      }
                    />
                    <div>
                      <p>VS</p>
                    </div>
                    <img
                      src={
                        teams.find(
                          (team) =>
                            team.teamAbv ===
                            rate.gameID.split("_")[1].split("@")[0]
                        ).nbaComLogo1
                      }
                    />
                  </div>
                  <div className="description-container">
                    <p className="description">
                      {rate.msg
                        .split("")
                        .map((char) =>
                          char === "\n" || char === "\t" ? (
                            char === "\n" ? (
                              <br key={uuidv4()} />
                            ) : (
                              <span
                                key={uuidv4()}
                                style={{ paddingLeft: "20px" }}
                              />
                            )
                          ) : (
                            char
                          )
                        )}
                    </p>
                  </div>
                  <div className="rating-container">
                    <p
                      className="rating-number"
                      style={{
                        boxShadow:
                          "0 0 10px 2px " + getColorOfRating(rate.rating),
                      }}
                    >
                      {rate.rating}
                    </p>
                  </div>
                  <div className="like-container">
                    {rate.liked_by.includes(username) ? (
                      <button onClick={() => handleLikeRate("unlike", index)}>
                        <BiSolidLike />
                      </button>
                    ) : (
                      <button onClick={(e) => handleLikeRate("like", index)}>
                        <BiLike />
                      </button>
                    )}
                    <p>{rate.liked_by.length} Likes</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <h3 className="no-ratings-msg">
              No rates from the past week... <br /> Be the first one to rate the
              last game!
            </h3>
          )
        ) : (
          <div className="loading-container">
            <img src={loadingImg} />
            {status === "error" ? (
              <p>It looks like we have a problem. try again later!</p>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default GameRates
