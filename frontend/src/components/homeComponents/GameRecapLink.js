import React, { useTransition } from "react"
import { useNavigate } from "react-router-dom"

import convertClock from "../../functions/convertClock"

function GameRecapLink({ teams, game, title }) {
  const navigate = useNavigate()

  const [isPending, startTransition] = useTransition()

  // get different jsx for a game recap an a game preview:
  function getJsx() {
    if (game.homePts)
      // if its a game recap:
      return (
        <div className="score">
          <div>
            {" "}
            <span className={+game.awayPts > +game.homePts ? "bold" : ""}>
              {game.awayPts}
            </span>{" "}
            -{" "}
            <span className={+game.awayPts < +game.homePts ? "bold" : ""}>
              {game.homePts}
            </span>
          </div>
          <div>{game.gameClock}</div>
        </div>
      )

    // if its a game preview:
    return (
      <div className="time-container">
        <p>
          {game.gameDate.slice(6)} - {game.gameDate.slice(4, 6)} -{" "}
          {game.gameDate.slice(2, 4)}
        </p>
        <p>
          {game.gameTime === "TBD" ? "TBD" : convertClock(game.gameTime) + "ET"}
        </p>
      </div>
    )
  }

  function handleNavigate() {
    startTransition(() => {
      if (title === "Game Recap") navigate("/GameRecap/" + game.gameID)
      else
        navigate(
          "/GamePreview/" +
            game.gameID +
            "/" +
            game.gameDate +
            "/" +
            game.gameTime
        )
    })
  }

  return (
    <div className="last-game-recap" onClick={handleNavigate}>
      <div className="title">
        <h1>{title}</h1>
        {game && game !== "error" && (
          <p>
            {game.away} @ {game.home}
          </p>
        )}
      </div>
      {game && game !== "error" && teams.length ? (
        <div className="scores-container">
          <img
            src={teams.find((team) => team.teamAbv === game.away).nbaComLogo1}
          />
          {getJsx()}
          <img
            src={teams.find((team) => team.teamAbv === game.home).nbaComLogo1}
          />
          {isPending && <div className="loader4 game-link-loader"></div>}
        </div>
      ) : game === "error" ? (
        <div className="error-container">
          {" "}
          <p>Problem getting the data :(</p>
          <p>Please try again later.</p>
        </div>
      ) : (
        <div className="loader2 add-margin"></div>
      )}
    </div>
  )
}

export default GameRecapLink
