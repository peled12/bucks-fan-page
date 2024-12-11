import React, { useState, useEffect } from "react"

import "./pages.css"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import shadowBuck1 from "../../images/bucks/shadow_buck.png"
import shadowBuck2 from "../../images/bucks/shadow_buck2.png"
import shadowBuck3 from "../../images/bucks/shadow_buck3.png"

import playerLoaderImg from "../../images/bucks/gray_logo.jpg"

import loadingImg from "../../images/loading_screen.png"

const options = {
  method: "GET",
  url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBATeamRoster",
  params: {
    teamAbv: "MIL",
    statsToGet: "averages",
  },
  headers: {
    "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
  },
}

function Roster() {
  const [players, setplayers] = useState([])
  const [isError, setisError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.request(options)
        setplayers(res.data.body.roster)
      } catch (err) {
        console.error("Failed to fetch roster.", err.message)
        setisError(true)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <p className="page-description">The Bucks roster.</p>
      <h1 className="page-title">Roster</h1>
      {players.length ? (
        <div className="players">
          {players.map((player) => {
            const name = player.bRefName || player.espnName
            return (
              <div key={uuidv4()} className="player">
                <p className="jerseyNum">{player.jerseyNum}</p>
                <a
                  target="blank"
                  href={"https://www.nba.com/player/" + player.nbaComID}
                  className="image-container"
                >
                  <img
                    src={player.nbaComHeadshot || playerLoaderImg}
                    className="headshot"
                  />
                  <img src={shadowBuck2} className="buck" />
                </a>
                <hr />
                <div className="name-container">
                  <img src={shadowBuck1} className="not-hovered" />
                  <p>{name}</p>
                  <div className="color-container">
                    <div className="hovered-name">
                      <p className="first-name">{name.split(" ")[0]}</p>
                      <img src={shadowBuck3} />
                      <p className="last-name">{name.split(" ")[1]}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
    </>
  )
}

export default Roster
