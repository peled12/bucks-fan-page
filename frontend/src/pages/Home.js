import React, { useState, useEffect, useContext } from "react"

import { Link, useNavigate } from "react-router-dom"

import "./home.css"

import Games from "../components/homeComponents/Games"

import handleGoToFanpost from "../functions/goToFanpost"
import timeAgo from "../functions/timeAgo"
import isUpToAWeekBefore from "../functions/isUpToAWeekBefore"
import formatGameDateString from "../functions/formatGameDateString"
import getColorOfRating from "../functions/getColorOfValue"

import defaultImg from "../images/bucks/gray_logo.jpg"
import amhoopsImg from "../images/channels/amhoops.png"
import mj2kallday from "../images/channels/mj2kallday.png"
import heatcheck from "../images/channels/heatcheck.png"
import jayworvs from "../images/channels/jaywarvs.png"
import kennyforreal from "../images/channels/kennyforreal.png"
import bucks from "../images/channels/bucks.png"
import giannisImg from "../images/giannis1.png"

import { v4 as uuidv4 } from "uuid"

import { Context } from "../App"

import axios from "axios"

import GameRecapLink from "../components/homeComponents/GameRecapLink"
import AddFriend from "../components/discussionsComponents/AddFriend"
import RatingSlide from "../components/homeComponents/RatingSlide"

import { FaQuestion } from "react-icons/fa"
import sleep from "../functions/sleep"

// great games api: https://rapidapi.com/tank01/api/tank01-fantasy-stats/

// date stuff:

const date = new Date()

const tomorDate = new Date(date)
tomorDate.setDate(date.getDate() + 1)

const currentTomorDate =
  tomorDate.getFullYear() +
  "" +
  (tomorDate.getMonth() + 1 < 10
    ? "0" + (tomorDate.getMonth() + 1)
    : tomorDate.getMonth() + 1) +
  "" +
  (tomorDate.getDate() < 10 ? "0" + tomorDate.getDate() : tomorDate.getDate())

//

// axios options:

const tomorowGamesOptions = {
  method: "GET",
  url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBAScoresOnly",
  params: {
    gameDate: currentTomorDate,
  },
  headers: {
    "x-rapidapi-key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "x-rapidapi-host": "tank01-fantasy-stats.p.rapidapi.com",
  },
}

const dbApiUrl = process.env.REACT_APP_API_URL

//

function Home({
  teams,
  articles,
  schedule,
  fanposts,
  fanpostsStatus,
  lastGamesRating,
  lastGamesRatingStatus,
  setlastGamesRating,
  yesterdayGames,
  tomorrowGames,
  settomorrowGames,
  lastBucksGame,
  nextBucksGame,
  isGameRatesError,
}) {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const [showLastNightGames, setshowLastNightGames] = useState(true)

  const navigate = useNavigate()

  //  tomorrow games data:
  async function fetchTomorrowGamesData() {
    try {
      const res = await axios.request(tomorowGamesOptions)

      // indicate no games will occurr tomorrow
      if (res.data.error && res.data.error === "No games returned") {
        settomorrowGames("offseason")
        return
      }

      const games = Object.values(res.data.body)

      settomorrowGames(games)
      localStorage.setItem("tomorGames", JSON.stringify(games)) // to save requests
    } catch (err) {
      console.error("Couldn't fetch tommorow's games.", err.message)
    }
  }

  function handleSelectChange() {
    setshowLastNightGames((prev) => {
      // if changed to see the games tomorrow, fetch to add the gameTime property
      if (prev && !tomorrowGames) fetchTomorrowGamesData()
      return !prev
    })
  }

  //

  // last game rating:

  const [filteredLastGamesRating, setfilteredLastGamesRating] = useState(null)
  const [averageLastGameRating, setaverageLastGameRating] = useState(null)
  const [averageLastGameRatingColor, setaverageLastGameRatingColor] =
    useState(null)

  const [lastGameRates, setlastGameRates] = useState(null)

  useEffect(() => {
    if (lastGamesRating && lastBucksGame) {
      const firstNonLastGameIndex = lastGamesRating.rates.findIndex(
        (rate) => rate.gameID !== lastBucksGame.gameID
      )

      const lastGameRates =
        firstNonLastGameIndex === -1
          ? lastGamesRating.rates
          : lastGamesRating.rates.slice(0, firstNonLastGameIndex)

      setlastGameRates(lastGameRates)

      setfilteredLastGamesRating(lastGameRates.slice(0, 5))

      const averageRating = lastGameRates.length
        ? // get the sum
          lastGameRates.reduce(
            (currentSum, obj) => currentSum + obj.rating,
            0
          ) / lastGameRates.length // divide by length
        : null

      setaverageLastGameRating(averageRating)
      setaverageLastGameRatingColor(getColorOfRating(averageRating))
    }
  }, [lastGamesRating, lastBucksGame])

  const [ratingValue, setratingValue] = useState(5)
  const [ratingMsg, setratingMsg] = useState("")

  function handleRatingMsgChange(e) {
    const lines = e.target.value.split("\n")
    const maxLines = 6
    if (lines.length <= maxLines) setratingMsg(e.target.value)
  }

  // to add tabs
  function handleTextAreaKeyDown(e) {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault()
      setratingMsg((prev) => prev + "\t")
    }
  }

  function patchLastGamesRating() {
    if (!isSignedIn) {
      navigate("/SignIn")
      setTimeout(() => alert("You must be signed in to rate the last game."))
      return
    }

    if (!lastBucksGame) {
      alert("Try again in just a moment...")
      return
    }

    const newRates = [
      {
        username: username,
        rating: ratingValue,
        msg: ratingMsg,
        gameID: lastBucksGame.gameID,
        liked_by: [],
      },
      ...lastGamesRating.rates,
    ]

    // start the animation
    const loader = document.querySelector(".home-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/polls/lastGamesRating", {
        rates: newRates,
      })
      .then(async () => {
        // update variables

        setlastGamesRating((prev) => {
          return { ...prev, rates: newRates }
        })

        // calculate the new average
        setaverageLastGameRating((prev) =>
          prev
            ? (prev * (newRates.length - 1) + ratingValue) / newRates.length
            : ratingValue
        )

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
        console.error("Couldn't patch last game's rating.", err.message)

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

  function getUserRating() {
    const userRate =
      isSignedIn && lastGameRates.find((user) => user.username === username)

    return userRate ? (
      <div>
        <p
          className="number"
          style={{
            border: "4px solid " + getColorOfRating(userRate.rating),
            boxShadow: "0 0 10px 2px " + getColorOfRating(userRate.rating),
          }}
        >
          {userRate.rating.toFixed(1)}
        </p>
      </div>
    ) : (
      <p
        className="number"
        style={{
          border: "4px solid " + getColorOfRating(ratingValue),
          boxShadow: "0 0 10px 2px " + getColorOfRating(ratingValue),
        }}
      >
        {ratingValue.toFixed(1)}
      </p>
    )
  }

  function handleNavigateGameRates(e, rater, gameID) {
    // return if clicked user options
    if (e.target.closest(".rater-name")) return

    // navigate to GameRates with a custom id if its in the past week
    if (isUpToAWeekBefore(formatGameDateString(gameID.split("_")[0])))
      navigate("/GameRates", {
        state: { rateID: (rater + "_" + gameID).replace(/@/g, "") },
      })
    else navigate("/GameRecap/" + gameID) // else navigate directly to the recap
  }

  //

  return (
    <>
      <h1 className="page-title">Home page</h1>
      <div className="loader4 home-loader"></div>
      <Games
        date={date}
        handleSelectChange={handleSelectChange}
        teams={teams}
        showLastNightGames={showLastNightGames}
        yesterdayGames={yesterdayGames}
        tomorrowGames={tomorrowGames}
        handleNavigateGameRecap={(gameID) => navigate("/GameRecap/" + gameID)}
        handleNavigateGamePreview={(gameID, gameDate, gameTime) =>
          navigate("/GamePreview/" + gameID + "/" + gameDate + "/" + gameTime)
        }
      />
      {isSignedIn &&
      lastGamesRating &&
      yesterdayGames &&
      yesterdayGames !== "offseason" &&
      lastGameRates &&
      !lastGameRates.some((obj) => obj.username === username) ? (
        <div className="last-game-rating-container">
          <div className="title">
            <h1>Rate The Last Game</h1>
          </div>
          <div className="details-container">
            <div className="rate-container">
              <div className="avarage-user-rate-container">
                <div className="user-rate">
                  <p className="number-type">Your Rating</p>
                  {getUserRating()}
                  <RatingSlide setValue={setratingValue} />
                </div>
                <div className="average-rate">
                  {averageLastGameRating ? (
                    <div className="average-rating">
                      <p className="avarage-rating-msg">Average Rating </p>{" "}
                      <p
                        className="number"
                        style={{
                          border: "2px solid " + averageLastGameRatingColor,
                          boxShadow:
                            "0 0 10px 2px " + averageLastGameRatingColor,
                        }}
                      >
                        {averageLastGameRating}
                      </p>
                    </div>
                  ) : (
                    <p className="number unknown-avg">
                      <FaQuestion />
                    </p>
                  )}
                </div>
              </div>
              <textarea
                className="describe-text"
                placeholder="Describe how the game was here..."
                value={ratingMsg}
                onChange={handleRatingMsgChange}
                onKeyDown={handleTextAreaKeyDown}
                spellCheck="false"
                maxLength={50}
              />
              {!lastGameRates.some((obj) => obj.username === username) && (
                <div className="submit-container">
                  <button className="submit" onClick={patchLastGamesRating}>
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : lastGamesRatingStatus === "loading" && isSignedIn ? (
        <div className="fething-last-game-rating-msg">
          <p>Fetching last game's rating...</p>
        </div>
      ) : (
        <div className="last-game-rating-expandor">hi</div>
      )}
      <div className="home-wrapper1">
        <div className="all-last-week-rates">
          <h1 className="game-rates-title">Game Rates</h1>
          <p className="average-msg">
            {averageLastGameRating &&
              `Last game average rating: ${averageLastGameRating}.`}
          </p>
          {filteredLastGamesRating ? (
            <div className="last-game-rates">
              <h1 className="title">Last Game Rates</h1>
              {lastBucksGame === "Last game yet to come" ? (
                <p className="last-game-rates-msg">
                  Our first game is yet to come!
                </p>
              ) : (
                <>
                  <div className="rate-title-container">
                    <p>Name</p>
                    <p>Date</p>
                    <p>Rating</p>
                  </div>
                  {filteredLastGamesRating.length ? (
                    filteredLastGamesRating.map((rate, index) => (
                      <div
                        key={uuidv4()}
                        className={
                          "rate-container " +
                          (index === filteredLastGamesRating.length - 1
                            ? "last"
                            : "")
                        }
                        onClick={(e) =>
                          handleNavigateGameRates(e, rate.username, rate.gameID)
                        }
                      >
                        <span className="rater-name">
                          <AddFriend name={rate.username} className="normal" />
                        </span>
                        <p className="game-date">
                          {formatGameDateString(rate.gameID.split("_")[0])}
                        </p>
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
                    ))
                  ) : (
                    <p className="last-game-rates-msg">No rates yet.</p>
                  )}
                </>
              )}
            </div>
          ) : lastGamesRatingStatus === "error" || isGameRatesError ? (
            <p className="fetching-error-msg">
              Problem fetching game rates. <br /> Please try again later.
            </p>
          ) : (
            <div className="loader6"></div>
          )}
        </div>

        <div className="recent-fanposts-container">
          <h1>Recent Fanposts</h1>
          {fanpostsStatus === "success" ? (
            <div className="recent-fanposts">
              {fanposts.length ? (
                fanposts.slice(0, 3).map((post, index) => (
                  <div key={uuidv4()} className="fanpost">
                    <a
                      onClick={() =>
                        handleGoToFanpost(post, index + 1, fanposts, navigate)
                      }
                    >
                      <img
                        src={post.img_url ? post.img_url : defaultImg}
                        alt=""
                      />
                    </a>
                    <div className="text-container">
                      <div className="title-container">
                        <a
                          onClick={() =>
                            handleGoToFanpost(
                              post,
                              index + 1,
                              fanposts,
                              navigate
                            )
                          }
                          className="link"
                        >
                          {post.title}
                        </a>
                      </div>
                      <p className="sub-title">{post.sub_title}</p>
                      <div>
                        By <AddFriend name={post.maker} className="normal" />
                        <span style={{ marginRight: "20px" }}></span>
                        {timeAgo(
                          post.date.year,
                          post.date.month,
                          post.date.day,
                          post.date.hour,
                          post.date.minute
                        )}
                        <span style={{ marginRight: "20px" }}></span>
                        {post.comments.length}{" "}
                        {post.comments.length === 1 ? "Comment" : "Comments"}
                        <span style={{ marginRight: "20px" }}></span>
                        {post.likedBy.length}{" "}
                        {post.likedBy.length === 1 ? "Like" : "Likes"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-fanposts-msg">
                  {isSignedIn ? (
                    <Link to="PostFanpost">Click Here</Link>
                  ) : (
                    <Link to="/SignIn">Sign In</Link>
                  )}{" "}
                  To create the first fanpost!
                </div>
              )}
            </div>
          ) : fanpostsStatus === "loading" ? (
            <div className="loader6"></div>
          ) : (
            <p className="fetching-error-msg">
              Problem fetching recent fanposts. <br /> Please try again later.
            </p>
          )}
        </div>
        {nextBucksGame !== "no games left" && (
          <div className="game-recaps">
            {lastBucksGame !== "Last game yet to come" && (
              <GameRecapLink
                teams={teams}
                game={lastBucksGame}
                title={
                  lastBucksGame && lastBucksGame !== "error"
                    ? lastBucksGame.gameClock.includes("Final")
                      ? "Game Recap"
                      : "Live Game"
                    : "Last Game"
                }
                schedule={schedule}
              />
            )}
            <GameRecapLink
              teams={teams}
              game={nextBucksGame}
              title="Game Preview"
              schedule={schedule}
            />
          </div>
        )}
      </div>
      <div className="home-wrapper2">
        <div className="articles-container">
          <h1 className="title">More Articles</h1>
          {articles ? (
            <>
              {articles.map((article, index) => {
                if (index < window.innerHeight / 150)
                  return (
                    <div key={uuidv4()} className="link-container">
                      <a className="link" href={article.url} target="_blank">
                        {article.title}
                      </a>
                      <em className="source">{article.source}</em>
                    </div>
                  )
              })}
              <hr />
              <a
                className="all-articles-link"
                onClick={() => navigate("/AllArticles")}
              >
                Browse all articles
              </a>
            </>
          ) : (
            <div class="loader2 add-margin"></div>
          )}
        </div>
        <img src={giannisImg} alt="Gianis pic" />
      </div>
      <div className="home-wrapper3">
        <div className="all-youtube-container">
          <h1 className="title">YouTube Channels Shoutouts</h1>
          <div className="channels-container">
            <div>
              <a
                href="https://www.youtube.com/@AMHoops/featured"
                target="_blank"
              >
                <img src={amhoopsImg} alt="YT channel" />
              </a>
              <p>A.M. Hoops</p>
            </div>
            <div>
              <a href="https://www.youtube.com/@MJ2KALLDAY" target="_blank">
                <img src={mj2kallday} alt="YT channel" />
              </a>
              <p>MJ2KALLDAY</p>
            </div>
            <div>
              <a href="https://www.youtube.com/@HeatCheck" target="_blank">
                <img src={heatcheck} alt="YT channel" />
              </a>
              <p>Heat Check</p>
            </div>
            <div>
              <a href="https://www.youtube.com/@jaywarvz" target="_blank">
                <img src={jayworvs} alt="YT channel" />
              </a>
              <p>Jay Warvz</p>
            </div>
            <div>
              <a href="https://www.youtube.com/@KennyFR" target="_blank">
                <img src={kennyforreal} alt="YT channel" />
              </a>
              <p>Kenny For Real</p>
            </div>
            <div>
              <a
                href="https://www.youtube.com/@bucks"
                target="_blank"
                alt="YT channel"
              >
                <img src={bucks} alt="YT channel" />
              </a>
              <p>Milwaukee Bucks</p>
            </div>
          </div>
        </div>
      </div>
      <div className="page-extendor">hi</div>
    </>
  )
}

export default Home
