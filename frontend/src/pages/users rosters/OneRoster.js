import React, { useState, useContext } from "react"

import "./userRoster.css"

import { useLocation, useNavigate } from "react-router-dom"

import { useQuery } from "react-query"

import getColorOfRating from "../../functions/getColorOfValue"

import loadingImg from "../../images/loading_screen.png"

import RosterSpot from "../../components/userInputComponents/RosterSpot"

import RatingSlide from "../../components/homeComponents/RatingSlide"

import axios from "axios"

import { Context } from "../../App"

import { v4 as uuidv4 } from "uuid"

import { players, coaches } from "./AllMen"

import sleep from "../../functions/sleep"
import fetchOneRoster from "../../functions/fetchOneRoster"
import refetch from "../../functions/refetch"

const dbApiUrl = process.env.REACT_APP_API_URL

const alts = ["PG", "SG", "SF", "PF", "C"]

function OneRoster() {
  const location = useLocation()
  const rosterMaker = location.pathname.split("/").at(-1)

  const navigate = useNavigate()

  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const [rating, setrating] = useState(5)

  const {
    data: roster,
    status,
    refetch: refetchOneRoster,
  } = useQuery({
    queryKey: "oneRoster",
    refetchOnWindowFocus: false,
    staleTime: 6000,
    queryFn: async () => {
      const rosterData = await fetchOneRoster(rosterMaker)

      changeAvarageRating(rosterData)

      return rosterData
    },
  })

  const [avarageRating, setavarageRating] = useState(
    () =>
      roster &&
      roster.rating.reduce((currentSum, obj) => currentSum + obj.rate, 0) /
        roster.rating.length
  )

  function changeAvarageRating(data) {
    setavarageRating(
      data.rating.reduce((currentSum, obj) => currentSum + obj.rate, 0) /
        data.rating.length
    )
  }

  function handleActivateBtn() {
    document.querySelector(".rate-roster-btn").classList.add("active")
  }

  function handleRateRoster() {
    if (!isSignedIn) {
      alert("You must be signed in to rate a roster!")
      navigate("/SignIn")
      return
    }

    const loader = document.querySelector(".one-roster-loader")

    // check if the button is activated
    if (
      document
        .querySelector(".rate-roster-btn")
        .classList.value.includes("active") &&
      (loader.style.opacity == "0" || loader.style.opacity === "")
    ) {
      loader.style.opacity = "1" // start the animation

      const newRating = [...roster.rating]

      // check if this user have already rated
      let index
      if (
        newRating.some((rating, currentIndex) => {
          if (rating.rater === username) {
            index = currentIndex // save the index

            return true
          }
        })
      )
        newRating[index].rate = rating // replace the rating
      else newRating.push({ rater: username, rate: rating })

      const updatedData = {
        roster: { ...roster, rating: newRating },
      }

      axios
        .patch(dbApiUrl + "/users/user/" + rosterMaker, updatedData)
        .then(async () => {
          changeAvarageRating(updatedData.roster)

          // animation handling

          await sleep(150)

          loader.style.color = "green"
          loader.style.animationPlayState = "paused"

          await sleep(250)

          loader.style.animationPlayState = "running"
          loader.style.opacity = "0"
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
          loader.style.opacity = "0"
          loader.style.color = "black"
        })
    }
  }

  return (
    <>
      <h1 className="page-title">User Roster</h1>
      <p className="page-description">
        {rosterMaker}'s roster.{" "}
        {roster && roster.rating.length ? (
          <>
            Their avarage rating is <b>{avarageRating}.</b>
          </>
        ) : (
          "Be the first one to rate their roster!"
        )}
      </p>
      <div className="loader4 main-one-roster-loader"></div>
      <button
        className="refetch-btn"
        onClick={() =>
          refetch(
            refetchOneRoster,
            document.querySelector(".main-one-roster-loader")
          )
        }
      >
        Refetch
      </button>
      {status === "success" ? (
        <div className="one-roster-container">
          <div className="all-roster">
            <div>
              {roster.players.slice(0, 5).map((name, index) => (
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
              {roster.players.slice(-8).map((name, index) => (
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
              {roster.coaches.map((name, index) => (
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
          <div className="rating-container">
            <h2>Your Rating</h2>
            <p
              className="number"
              style={{
                boxShadow: "0 0 13px 3px " + getColorOfRating(rating),
              }}
            >
              {rating}
              {Number.isInteger(rating) && ".0"}
            </p>
            <div className="in-container">
              <span onMouseDown={handleActivateBtn}>
                <RatingSlide setValue={setrating} />
              </span>
              <>
                <div className="loader4 one-roster-loader"></div>
                <button className="rate-roster-btn" onClick={handleRateRoster}>
                  Submit
                </button>
              </>
            </div>
          </div>
          <div className="page-expandor">hi</div>
        </div>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} alt="loading" />
          {status === "loading" ? (
            <p>Loading...</p>
          ) : (
            <p>An error had occured. Please try again later.</p>
          )}
        </div>
      )}
    </>
  )
}

export default OneRoster
