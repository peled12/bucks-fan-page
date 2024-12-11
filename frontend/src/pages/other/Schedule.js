import React from "react"

import { useNavigate } from "react-router-dom"

import "./pages.css"

import { v4 as uuidv4 } from "uuid"

import loadingImg from "../../images/loading_screen.png"

import wisconsinLogo from "../../images/wisconsin_logo.png"

import convertClock from "../../functions/convertClock"

const months = [
  { name: "January", num: 1 },
  { name: "February", num: 2 },
  { name: "March", num: 3 },
  { name: "April", num: 4 },
  { name: "May", num: 5 },
  { name: "June", num: 6 },
  { name: "July", num: 7 },
  { name: "August", num: 8 },
  { name: "September", num: 9 },
  { name: "October", num: 10 },
  { name: "November", num: 11 },
  { name: "December", num: 12 },
]

function Schedule({ teams, schedule, isLoading, isError }) {
  const navigate = useNavigate()

  // function that decided to trasfer to game recap or game preview
  function handleNavigate(game) {
    if (game.gameStatus === "Completed") navigate("/GameRecap/" + game.gameID)
    else navigate("/GamePreview/" + game.gameID)
  }

  return (
    <div className="schedule-page">
      <h1 className="page-title">Schedule</h1>
      <p className="page-description">
        Every scheduled Bucks game this season is right here!
      </p>
      {!isError && !isLoading ? (
        <div className="schedule-container">
          {schedule.map((game, index) => {
            const monthNum = parseInt(game.gameID.substring(4, 6)) // get the month

            if (game && schedule[index - 1]) {
              if (
                monthNum !==
                parseInt(schedule[index - 1].gameID.substring(4, 6))
              )
                var month = months.find(
                  (monthObj) => monthObj.num === monthNum
                ).name
            } else if (monthNum === 10) var month = "October"
            return game ? (
              <>
                {month && (
                  <div key={uuidv4()} className="title-month">
                    <h1>{month}</h1>
                  </div>
                )}
                <div
                  key={uuidv4()}
                  className={"game " + (index % 2 === 1 ? "odd" : "")}
                  onClick={() => handleNavigate(game)}
                >
                  <div className="playing-teams">
                    <img
                      src={
                        teams.find((team) => game.away === team.teamAbv)
                          .nbaComLogo1
                      }
                    />
                    <img
                      src={
                        teams.find((team) => game.home === team.teamAbv)
                          .nbaComLogo1
                      }
                    />
                  </div>
                  {game.gameStatus === "Completed" ? (
                    <div className="game-score">
                      <div className="team-score">
                        <p className={game.awayResult === "W" ? "bold" : ""}>
                          {game.awayPts}
                        </p>
                      </div>
                      <div className="team-score">
                        <p className={game.homeResult === "W" ? "bold" : ""}>
                          {game.homePts}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="time">
                      {game.gameTime === "TBD"
                        ? "TBD"
                        : convertClock(game.gameTime) + "ET"}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div key={uuidv4()} className="game game-loading">
                <div className="loader1 loading-game"></div>
                <img src={wisconsinLogo} />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} />
          {isLoading ? (
            <p>It looks like we have a problem. try again later!</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Schedule
