import React, { useTransition, useEffect, useContext, useState } from "react"

import { useLocation } from "react-router-dom"

import { useNavigate } from "react-router-dom"

import "./pages.css"

import { Context } from "../../App"

import axios from "axios"

import sleep from "../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function Guide() {
  const navigate = useNavigate()

  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]
  const userData = useContext(Context)[8]

  const location = useLocation()

  const [isPending, startTransition] = useTransition()

  const [visibleLeaderboard, setvisibleLeaderboard] = useState(null)

  useEffect(() => {
    userData && setvisibleLeaderboard(userData.roster.visible)
  }, [userData])

  function handleNavigate(path) {
    startTransition(() => navigate(path))
  }

  useEffect(() => {
    if (location.state && location.state.scrollDown)
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  }, [])

  function handleChangeLeaderboardVisibilty() {
    // start the animation
    const loader = document.querySelector(".guide-page-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/users/user/" + username, {
        roster: { ...userData.roster, visible: !userData.roster.visible },
      })
      .then(async () => {
        setvisibleLeaderboard((prev) => !prev)

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
        console.error("Failed to change visibilty", err.message)

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
    <div className="guide-page">
      <h1 className="page-title">Guide</h1>
      <p className="page-description">
        A shortened guide page to help navigating and understanding this
        website.
      </p>
      <div className="guide-container">
        <div className="text-container">
          {isPending && <div className="loader5"></div>}
          <h1>Guideline</h1>
          <h2>Welcome to the Bucks Fan Page!</h2>
          <p>
            This Bucks community allows you to express your opinions about the
            Milwaukee Bucks or basketball in general.
          </p>
          <p>
            Discuss collectively via{" "}
            <a onClick={() => handleNavigate("/TradeIdeas")}>trade ideas</a> and{" "}
            <a onClick={() => handleNavigate("/Fanposts")}>fanposts</a>, and
            discuss personally via DM's!
          </p>
          <p>
            You can also check out details about the Bucks{" "}
            <a onClick={() => handleNavigate("/Roster")}>roster</a> and{" "}
            <a onClick={() => handleNavigate("/Schedule")}>schedule</a> and
            browse through the statistics of each Bucks player!
          </p>
          <p>
            Check out game previews and recaps, there I summerized the game and
            everything you need to know before the game, including pregame
            polls.
          </p>
          <p>
            You can click on a user's name to DM them or add them as a friend.
          </p>
          <p>
            Explore{" "}
            <a onClick={() => handleNavigate("/AllArticles")}>articles</a> about
            what was going on in the NBA lately!
          </p>
          <p>
            Getting likes in comments will grant You coins! Likes on your post
            will grant you even more!
          </p>
          <p>
            Use your coins to buy Bucks players or coaches and climb up the
            leader board of the best rosters!
          </p>
          <h2 className="game-title">And About Our Little Game...</h2>
          <p>Use coins to buy players and coaches to improve you're team!</p>
          <p>
            Coins can be earned by getting likes on anything you post. Getting
            likes on comments can also grant you coins, but less. As well as
            rating other user's rosters.
          </p>
          <p>
            You can put on your roster 5 starters, 8 rotation players and 3
            coaches.
          </p>
          {isSignedIn && (
            <p style={{ display: "flex" }}>
              To{" "}
              {visibleLeaderboard !== null
                ? visibleLeaderboard
                  ? "hide"
                  : "show"
                : "show / hide"}{" "}
              your account from the leaderboard,{" "}
              <button
                className="change-visibility-btn"
                onClick={handleChangeLeaderboardVisibilty}
              >
                click here!
              </button>
              <div className="loader4 guide-page-loader"></div>
            </p>
          )}
          <p>
            For you to be climb on the{" "}
            <a onClick={() => handleNavigate("/Leaderboard/0-5")}>
              leaderboard
            </a>
            , spend the most money on players and coaches and get good ratings!
          </p>
          {!isSignedIn && (
            <p style={{ fontWeight: "600" }}>Sign in to start playing!</p>
          )}
          <h2 style={{ marginTop: "5vh" }}>Good Luck!</h2>
          <div className="page-expandor">hi</div>
        </div>
      </div>
    </div>
  )
}

export default Guide
