import React, { useEffect } from "react"

import "./pages.css"

import { v4 as uuidv4 } from "uuid"

import getColorOfRating from "../../functions/getColorOfValue"

import loadingImg from "../../images/loading_screen.png"

import { useLocation } from "react-router-dom"
import AddFriend from "../../components/discussionsComponents/AddFriend"

function GameRates({ lastWeekGameRating, status, teams }) {
  const location = useLocation()
  const clickedRateID = location.state && location.state.rateID

  // init scroll
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

  return (
    <>
      <h1 className="page-title">Game Rates</h1>
      <p className="page-description">
        All ratings from Bucks fans from games of the past week
      </p>
      <div
        className="last-week-ratings"
        style={
          lastWeekGameRating && !lastWeekGameRating.length
            ? { border: "none" }
            : {}
        }
      >
        {lastWeekGameRating ? (
          lastWeekGameRating.length ? (
            <>
              <div className="title-container">
                <p className="name-title">Name</p>
                <p className="game-title">Game</p>
                <p className="description-title">Description</p>
                <p className="rating-title">Rating</p>
              </div>
              {lastWeekGameRating.map((rate, index) => (
                <div
                  key={uuidv4()}
                  className={
                    "last-week-rate " +
                    (rate.username +
                      "_" +
                      rate.gameID.replace(/@/g, "") +
                      " ") +
                    (index % 2 === 0 ? "even " : "") +
                    (index === lastWeekGameRating.length - 1 ? "last" : "")
                  }
                >
                  <span className="name-container">
                    <AddFriend name={rate.username} className="normal" />
                  </span>
                  <div className="game-container">
                    <img
                      alt="team logo"
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
                      alt="team logo"
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
            <img src={loadingImg} alt="loading" />
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
