import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

import "./games.css"

import StatBar from "../../components/gameComponents/StatBar"
import BoxScore from "../../components/gameComponents/BoxScore"
import LineScoreTable from "../../components/gameComponents/LineScoreTable"

import isAroundGame from "../../functions/isAroundGame"
import getQuestionsArray from "../../functions/getQuestionsArray"

import { GoDotFill } from "react-icons/go"

import axios from "axios"

import "./games.css"

import loadingImg from "../../images/loading_screen.png"
import Poll from "../../components/gameComponents/Poll"

import { useQuery } from "react-query"

const dbApiUrl = process.env.REACT_APP_API_URL

function GameRecap({ teams, schedule }) {
  const [polls, setpolls] = useState(null)

  const { pollsStatus } = useQuery({
    queryKey: ["postGamePolls"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      axios
        .get(dbApiUrl + "/polls/lastGame")
        .then((res) => {
          setpolls(res.data)
        })
        .catch((err) => {
          console.error("Failed to get polls.", err.message)
        })
    },
  })

  const location = useLocation()
  const pathNameSplit = location.pathname.split("/")

  const isBucksGame = location.pathname.includes("MIL")

  const [game, setgame] = useState(null)
  const [isError, setisError] = useState(false)

  const [bucksSide, setbucksSide] = useState("")

  const [displayingThing, setdisplayingThing] = useState("overview")

  const [awayTeamAbv, homeTeamAbv] = pathNameSplit[2]
    .match(/_([^_]*)$/)[1]
    .split("@")

  const homeTeam = teams.find((team) => team.teamAbv === homeTeamAbv)
  const awayTeam = teams.find((team) => team.teamAbv === awayTeamAbv)

  const gameDate = /^[^_]+/.exec(pathNameSplit[2])[0]

  const isGameAround = isAroundGame(schedule, gameDate)

  useEffect(() => {
    const options = {
      method: "GET",
      url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBABoxScore",
      params: {
        gameID: pathNameSplit[pathNameSplit.length - 1],
      },
      headers: {
        "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
        "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
      },
    }

    async function fetchGame() {
      try {
        const res = await axios.request(options)

        setgame(() => {
          if (Object.keys(res.data.body).length) return res.data.body

          setisError(true)
          return null
        })

        setbucksSide(res.data.body.home === "MIL" ? "right" : "left")
      } catch (err) {
        console.error("Failed to get game.", err.message)
        setisError(true)
      }
    }

    fetchGame()
  }, [])

  function handleChange(value) {
    setdisplayingThing(value)
  }

  return (
    <>
      <p className="page-description">
        Game preview for {homeTeam.teamName + " vs " + awayTeam.teamName}.
      </p>
      <h1 className="page-title">Game Recap</h1>
      {game && teams ? (
        <div className="game-container">
          <div className="title">
            <img
              className="team-img"
              src={teams.find((team) => team.teamAbv === game.away).nbaComLogo1}
            />
            <div className="final-score">
              <p>
                <span className={+game.awayPts > +game.homePts ? "bold" : ""}>
                  {game.awayPts}
                </span>{" "}
                -{" "}
                <span className={+game.homePts > +game.awayPts ? "bold" : ""}>
                  {game.homePts}
                </span>
              </p>
              <p>{game.gameClock && game.gameClock}</p>
            </div>
            <img
              className="team-img"
              src={teams.find((team) => team.teamAbv === game.home).nbaComLogo1}
            />
          </div>
          <hr className="to-stats" />
          <div
            className="displaying-thing-menu"
            style={isGameAround ? { width: "30vw" } : {}}
          >
            <button
              className={displayingThing === "overview" ? "active" : ""}
              onClick={() => handleChange("overview")}
              style={isGameAround ? { width: "33.33333%" } : {}}
            >
              Overview
            </button>
            <button
              className={displayingThing === "box score" ? "active" : ""}
              onClick={() => handleChange("box score")}
              style={isGameAround ? { width: "33.33333%" } : {}}
            >
              Box Score
            </button>
            {isGameAround && (
              <button
                className={displayingThing === "predictions" ? "active" : ""}
                onClick={() => handleChange("predictions")}
                style={isGameAround ? { width: "33.33333%" } : {}}
              >
                Predictions
              </button>
            )}
          </div>
          {displayingThing === "overview" ? (
            <>
              <LineScoreTable game={game} />
              <div className="stats-container">
                <div className="stats">
                  <StatBar
                    name="Rebounds"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["reb"]}
                    homeStat={game.teamStats[game.home]["reb"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Assists"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["ast"]}
                    homeStat={game.teamStats[game.home]["ast"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Steals"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["stl"]}
                    homeStat={game.teamStats[game.home]["stl"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Blocks"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["blk"]}
                    homeStat={game.teamStats[game.home]["blk"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Turn Overs"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["TOV"]}
                    homeStat={game.teamStats[game.home]["TOV"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Personal Fouls"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["PF"]}
                    homeStat={game.teamStats[game.home]["PF"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="3PT Makes"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["tptfgm"]}
                    homeStat={game.teamStats[game.home]["tptfgm"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="FG Makes"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["fgm"]}
                    homeStat={game.teamStats[game.home]["fgm"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="FT Makes"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["ftm"]}
                    homeStat={game.teamStats[game.home]["ftm"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Point In Paint"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["pointsInPaint"]}
                    homeStat={game.teamStats[game.home]["pointsInPaint"]}
                    dotIcon={<GoDotFill />}
                  />
                  <StatBar
                    name="Largest Lead"
                    bucksSide={bucksSide}
                    awayStat={game.teamStats[game.away]["largestLead"]}
                    homeStat={game.teamStats[game.home]["largestLead"]}
                    dotIcon={<GoDotFill />}
                  />
                </div>
              </div>
            </>
          ) : displayingThing === "box score" ? (
            <>
              <BoxScore
                playerStats={Object.entries(game.playerStats)
                  .filter(([playerID, player]) =>
                    isBucksGame
                      ? player.teamAbv === "MIL"
                      : player.teamAbv === game.home
                  )
                  .sort((a, b) => b.pts - a.pts)}
                currentlyPlaying={
                  Object.keys(game.currentlyPlaying).length
                    ? game.currentlyPlaying.home
                    : []
                }
                teamAbv={game.home}
              />
              <BoxScore
                playerStats={Object.entries(game.playerStats)
                  .filter(([playerID, player]) =>
                    isBucksGame
                      ? player.teamAbv !== "MIL"
                      : player.teamAbv !== game.home
                  )
                  .sort((a, b) => b.pts - a.pts)}
                currentlyPlaying={
                  Object.keys(game.currentlyPlaying).length
                    ? game.currentlyPlaying.home
                    : []
                }
                teamAbv={game.away}
              />
            </>
          ) : polls ? (
            <div className="polls-container">
              {getQuestionsArray(
                bucksSide === "right" ? awayTeam.teamName : homeTeam.teamName
              ).map((poll, index) => (
                <Poll
                  key={index}
                  poll={polls["q" + (index + 1)]}
                  options={poll}
                  isPending={"show results"}
                  pollIndex={index}
                  isRecap={true}
                />
              ))}
            </div>
          ) : (
            <div className="loading-container loading-polls">
              <img src={loadingImg} />
              {pollsStatus === "error" ? (
                <p>It looks like we have a problem. try again later!</p>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          )}
          <div className="scroll-expandor">hi</div>
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

export default GameRecap
