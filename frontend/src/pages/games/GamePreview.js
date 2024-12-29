import React, { useState, useContext } from "react"
import { useLocation } from "react-router-dom"

import "./games.css"

import convertClock from "../../functions/convertClock"
import StatBar from "../../components/gameComponents/StatBar"

import loadingImg from "../../images/loading_screen.png"

import isAroundGame from "../../functions/isAroundGame"
import getQuestionsArray from "../../functions/getQuestionsArray"

import { GoDotFill } from "react-icons/go"

import axios from "axios"

import Poll from "../../components/gameComponents/Poll"

import { useQuery } from "react-query"

import { v4 as uuidv4 } from "uuid"

import { Context } from "../../App"

const dbApiUrl = process.env.REACT_APP_API_URL

function GamePreview({ teams, schedule }) {
  const [polls, setpolls] = useState(null)

  const { status: pollsStatus } = useQuery({
    queryKey: ["preGamePolls"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      axios
        .get(dbApiUrl + "/polls/nextGame")
        .then((res) => {
          setpolls(res.data)
        })
        .catch((err) => {
          console.error("Failed to get polls.", err.message)
        })
    },
  })

  const userName = useContext(Context)[2]

  const location = useLocation()
  const pathNameSplit = location.pathname.split("/")

  const isBucksGame = location.pathname.includes("MIL")

  const [awayTeamAbv, homeTeamAbv] = pathNameSplit[2]
    .match(/_([^_]*)$/)[1]
    .split("@")

  const homeTeam = teams.find((team) => team.teamAbv === homeTeamAbv)
  const awayTeam = teams.find((team) => team.teamAbv === awayTeamAbv)

  const bucksSide = homeTeamAbv === "MIL" ? "right" : "left"

  const gameDate = pathNameSplit[3]
  const gameTime = pathNameSplit[4]

  const isGameAround = isAroundGame(schedule, gameDate)

  const [displayingThing, setdisplayingThing] = useState("preview")
  const [isPending, setisPending] = useState(false)

  const { data: bettingOdds, status: bettingOddsStatus } = useQuery({
    queryKey: ["bettingOdds"],
    queryFn: async () => {
      const gameID = gameDate + "_" + awayTeamAbv + "@" + homeTeamAbv
      const options = {
        method: "GET",
        url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBABettingOdds",
        params: {
          gameID: gameID,
        },
        headers: {
          "X-RapidAPI-Key":
            "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
          "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
        },
      }
      try {
        const res = await axios.request(options)
        if (res.data.error) return res.data
        return res.data.body[gameID]
      } catch (err) {
        console.error("Failed to get betting odds.", err.message)
      }
    },
  })

  const { data: homeTP, status: homeTPStatus } = useQuery({
    queryKey: ["homeTP"],
    queryFn: async () => {
      function getOptions(ID) {
        return {
          method: "GET",
          url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo",
          params: {
            playerID: ID,
            statsToGet: "averages",
          },
          headers: {
            "X-RapidAPI-Key":
              "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
            "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
          },
        }
      }
      try {
        const pointsLeaderRes = await axios.request(
          getOptions(homeTeam.topPerformers.pts.playerID[0])
        )
        const pointsLeader = pointsLeaderRes.data.body

        const asistsLeaderRes = await axios.request(
          getOptions(homeTeam.topPerformers.ast.playerID[0])
        )
        const asistsLeader = asistsLeaderRes.data.body

        const reboundLeaderRes = await axios.request(
          getOptions(homeTeam.topPerformers.reb.playerID[0])
        )
        const reboundsLeader = reboundLeaderRes.data.body

        return [
          { ...pointsLeader, stat1: "pts", stat2: "mins" },
          { ...asistsLeader, stat1: "ast", stat2: "TOV" },
          { ...reboundsLeader, stat1: "reb", stat2: "OffReb" },
        ]
      } catch (err) {
        console.error("Failed to get top performers stats.", err.message)
      }
    },
  })

  const { data: awayTP, status: awayTPStatus } = useQuery({
    queryKey: ["awayTP"],
    queryFn: async () => {
      function getOptions(ID) {
        return {
          method: "GET",
          url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerInfo",
          params: {
            playerID: ID,
            statsToGet: "averages",
          },
          headers: {
            "X-RapidAPI-Key":
              "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
            "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
          },
        }
      }
      try {
        const pointsLeaderRes = await axios.request(
          getOptions(awayTeam.topPerformers.pts.playerID[0])
        )
        const pointsLeader = pointsLeaderRes.data.body

        const asistsLeaderRes = await axios.request(
          getOptions(awayTeam.topPerformers.ast.playerID[0])
        )
        const asistsLeader = asistsLeaderRes.data.body

        const reboundLeaderRes = await axios.request(
          getOptions(awayTeam.topPerformers.reb.playerID[0])
        )
        const reboundsLeader = reboundLeaderRes.data.body

        return [
          { ...pointsLeader, stat1: "pts", stat2: "mins" },
          { ...asistsLeader, stat1: "ast", stat2: "TOV" },
          { ...reboundsLeader, stat1: "reb", stat2: "OffReb" },
        ]
      } catch (err) {
        console.error("Failed to get top performers stats.", err.message)
      }
    },
  })

  function patchPolls(
    currentPoll,
    question,
    selectedOptionVotes,
    questionIndexStr
  ) {
    // create the new variable:
    const newSelectedOptionVotes = polls[question][selectedOptionVotes] + 1

    const newAllVoters = [...polls[question].all_voters]
    newAllVoters.push(userName)

    //

    setisPending(questionIndexStr)

    if (!isPending)
      axios
        .patch(dbApiUrl + "/polls/nextGame", {
          [question]: {
            ...currentPoll,
            [selectedOptionVotes]: newSelectedOptionVotes,
            // contains the voters of this option
            all_voters: newAllVoters,
          },
        })
        .then(() => {
          setisPending(false)
        })
        .catch((err) => {
          console.error("Failed to patch polls.", err.message)
        })
  }

  return (
    <>
      <p className="page-description">
        Game preview for {homeTeam.teamName + " vs " + awayTeam.teamName}.
      </p>
      <h1 className="page-title" style={{ right: 0 }}>
        Game Preview
      </h1>
      <div className="game-container">
        <div className="title">
          <div className="logo-container">
            <div>
              {bettingOddsStatus === "success" ? (
                bettingOdds && !bettingOdds.error ? (
                  bettingOdds.draftkings.awayTeamMLOdds
                ) : (
                  ""
                )
              ) : (
                <div className="loader4"></div>
              )}
            </div>
            <img
              className="team-img"
              alt="away team logo"
              src={awayTeam.nbaComLogo1}
            />
            <p>
              {awayTeam.wins} - {awayTeam.loss}
            </p>
            <p className="streak-msg">
              Current Streak: {awayTeam.currentStreak.length}
              {awayTeam.currentStreak.result}
            </p>
          </div>
          <div className="time-container">
            <p>VS</p>
            <p>
              {gameDate.slice(6)} - {gameDate.slice(4, 6)} -{" "}
              {gameDate.slice(2, 4)}
            </p>
            <p>{gameTime === "TBD" ? "TBD" : convertClock(gameTime) + "ET"}</p>
          </div>
          <div className="logo-container">
            <div>
              {bettingOddsStatus === "success" ? (
                bettingOdds && !bettingOdds.error ? (
                  bettingOdds.draftkings.homeTeamMLOdds
                ) : (
                  ""
                )
              ) : (
                <div className="loader4"></div>
              )}
            </div>
            <img
              className="team-img"
              alt="home team logo"
              src={homeTeam.nbaComLogo1}
            />
            <p>
              {homeTeam.wins} - {homeTeam.loss}
            </p>
            <p className="streak-msg">
              Current Streak: {homeTeam.currentStreak.length}
              {homeTeam.currentStreak.result}
            </p>
          </div>
        </div>
        <hr className="to-stats" />
        {isGameAround ? (
          <div className="displaying-thing-menu">
            <button
              className={displayingThing === "preview" ? "active" : ""}
              onClick={() => setdisplayingThing("preview")}
            >
              Preview
            </button>
            {isBucksGame && (
              <button
                className={displayingThing === "polls" ? "active" : ""}
                onClick={() => setdisplayingThing("polls")}
              >
                Polls
              </button>
            )}
          </div>
        ) : (
          <h1>Game Preview</h1>
        )}
        {displayingThing === "preview" ? (
          <div className="stats-container">
            <div className="stats">
              <h1 className="preview-title">Top Performers</h1>
              {homeTP &&
              awayTP &&
              homeTPStatus === "success" &&
              awayTPStatus === "success" ? (
                <div className="top-performers-container">
                  <div
                    className={"home " + (bucksSide === "left" ? "bucks" : "")}
                  >
                    {awayTP.map((player) => (
                      <a
                        key={uuidv4()}
                        href={"https://www.nba.com/player/" + player.nbaComID}
                        target="_blank"
                      >
                        <img src={player.nbaComHeadshot} alt="player image" />
                        <div className="stats">
                          <p>
                            {player.stats[player.stat1]}{" "}
                            {player.stat1.toUpperCase()}
                          </p>
                          <p>
                            {player.stats[player.stat2]}{" "}
                            {player.stat2.toUpperCase()}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div
                    className={"away " + (bucksSide === "right" ? "bucks" : "")}
                  >
                    {homeTP.map((player) => (
                      <a
                        key={uuidv4()}
                        href={"https://www.nba.com/player/" + player.nbaComID}
                        target="_blank"
                      >
                        <img src={player.nbaComHeadshot} alt="player image" />
                        <div className="stats">
                          <p>
                            {player.stats[player.stat1]}{" "}
                            {player.stat1.toUpperCase()}
                          </p>
                          <p>
                            {player.stats[player.stat2]}{" "}
                            {player.stat2.toUpperCase()}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="loader6 top-performers-loader"></div>
              )}
              <h1 className="preview-title">Team Stats</h1>
              <StatBar
                name="Points"
                bucksSide={bucksSide}
                homeStat={homeTeam.ppg}
                awayStat={awayTeam.ppg}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Rebounds"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.reb.Total}
                awayStat={awayTeam.offensiveStats.reb.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Assists"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.ast.Total}
                awayStat={awayTeam.offensiveStats.ast.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Steals"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.stl.Total}
                awayStat={awayTeam.offensiveStats.stl.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Blocks"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.blk.Total}
                awayStat={awayTeam.offensiveStats.blk.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="FG makes"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.fgm.Total}
                awayStat={awayTeam.offensiveStats.fgm.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="FT Makes"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.ftm.Total}
                awayStat={awayTeam.offensiveStats.ftm.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="3PT Makes"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.tptfgm.Total}
                awayStat={awayTeam.offensiveStats.tptfgm.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Turn Overs"
                bucksSide={bucksSide}
                homeStat={homeTeam.offensiveStats.TOV.Total}
                awayStat={awayTeam.offensiveStats.TOV.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Defensive Points"
                bucksSide={bucksSide}
                homeStat={homeTeam.defensiveStats.pts.Total}
                awayStat={awayTeam.defensiveStats.pts.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="DFG Makes"
                bucksSide={bucksSide}
                homeStat={homeTeam.defensiveStats.fgm.Total}
                awayStat={awayTeam.defensiveStats.fgm.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="D3PT Makes"
                bucksSide={bucksSide}
                homeStat={homeTeam.defensiveStats.tptfgm.Total}
                awayStat={awayTeam.defensiveStats.tptfgm.Total}
                dotIcon={<GoDotFill />}
              />
              <StatBar
                name="Defensive Turn Overs"
                bucksSide={bucksSide}
                homeStat={homeTeam.defensiveStats.TOV.Total}
                awayStat={awayTeam.defensiveStats.TOV.Total}
                dotIcon={<GoDotFill />}
              />
            </div>
          </div>
        ) : polls ? (
          <div className="polls-container">
            {getQuestionsArray(
              bucksSide === "right" ? awayTeam.teamName : homeTeam.teamName
            ).map((poll, index) => (
              <Poll
                key={index}
                poll={polls["q" + (index + 1)]}
                options={poll}
                patchPolls={patchPolls}
                isPending={isPending}
                pollIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="loading-container loading-polls">
            <img src={loadingImg} alt="loading" />
            {pollsStatus === "error" ? (
              <p>It looks like we have a problem. try again later!</p>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        )}
        <div className="scroll-expandor">hi</div>
      </div>
    </>
  )
}

export default GamePreview
