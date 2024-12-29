import React from "react"

import { RiArrowUpSFill } from "react-icons/ri"

import convertClock from "../../functions/convertClock"

function Games({
  date,
  handleSelectChange,
  teams,
  showLastNightGames,
  yesterdayGames,
  tomorrowGames,
  handleNavigateGameRecap,
  handleNavigateGamePreview,
}) {
  function navigateGamePreview(game) {
    // make sure gameTime is already fetched
    if (game.gameTime)
      handleNavigateGamePreview(game.gameID, game.gameDate, game.gameTime)
  }

  return (
    <>
      <div className="games-container">
        <div className="first-box">
          <select onChange={handleSelectChange}>
            <option>Last Night</option>
            <option>Next Games</option>
          </select>
          <p className="current-date">
            {date.toString().split(" ")[0] +
              ", " +
              date.toLocaleString("en-US", { month: "short" }) +
              " " +
              date.getDate()}
          </p>
        </div>
        {teams.length ? (
          showLastNightGames ? (
            yesterdayGames ? (
              yesterdayGames.length && yesterdayGames !== "offseason" ? (
                yesterdayGames.map((game) => {
                  return (
                    <div
                      key={game.gameID}
                      onClick={() => handleNavigateGameRecap(game.gameID)}
                    >
                      <div className="playing-teams">
                        <img
                          alt="away team logo"
                          src={
                            teams.find((team) => game.away === team.teamAbv)
                              .nbaComLogo1
                          }
                        />
                        <p>{game.gameClock}</p>
                        <img
                          about="home team logo"
                          src={
                            teams.find((team) => game.home === team.teamAbv)
                              .nbaComLogo1
                          }
                        />
                      </div>
                      <div className="game-score">
                        {game.gameClock ? (
                          <>
                            <div className="team-score">
                              <p
                                className={
                                  game.awayResult === "W" ? "bold" : ""
                                }
                              >
                                {game.awayPts}
                              </p>
                              {
                                <RiArrowUpSFill
                                  style={{
                                    opacity: game.awayResult === "W" ? 1 : 0,
                                  }}
                                />
                              }
                            </div>
                            <div className="team-score">
                              <p>{convertClock(game.gameTime)}ET</p>
                              <RiArrowUpSFill style={{ opacity: 0 }} />
                            </div>
                            <div className="team-score">
                              <p
                                className={
                                  game.homeResult === "W" ? "bold" : ""
                                }
                              >
                                {game.homePts}
                              </p>
                              {
                                <RiArrowUpSFill
                                  style={{
                                    opacity: game.homeResult === "W" ? 1 : 0,
                                  }}
                                />
                              }
                            </div>
                          </>
                        ) : (
                          <p>Game Postponed</p>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="loading-games">
                  {yesterdayGames === "offseason"
                    ? "No Games Yet!"
                    : "No games found!"}
                </p>
              )
            ) : (
              ""
            )
          ) : tomorrowGames ? (
            tomorrowGames.length && tomorrowGames !== "offseason" ? (
              tomorrowGames.map((game) => {
                return (
                  <div
                    key={game.gameID}
                    onClick={() => navigateGamePreview(game)}
                    style={!game.gameTime ? { cursor: "wait" } : {}}
                  >
                    <div className="playing-teams">
                      <img
                        alt="away team logo"
                        src={
                          teams.find((team) => game.home === team.teamAbv)
                            .nbaComLogo1
                        }
                      />
                      <p>VS</p>
                      <img
                        alt="home team logo"
                        src={
                          teams.find((team) => game.away === team.teamAbv)
                            .nbaComLogo1
                        }
                      />
                    </div>
                    <div className="game-score">
                      {game.gameTime ? (
                        <p>{convertClock(game.gameTime)}ET</p>
                      ) : (
                        <div className="loader9"></div>
                      )}
                    </div>
                    {game.gameClock && (
                      <RiArrowUpSFill
                        className={game.homeResult === "W" ? "right" : "left"}
                      />
                    )}
                  </div>
                )
              })
            ) : (
              <p className="loading-games">
                {tomorrowGames === "offseason"
                  ? "No Games Yet!"
                  : "No games found!"}
              </p>
            )
          ) : (
            ""
          )
        ) : (
          <div className="loader10 loading-games"></div>
        )}
      </div>
    </>
  )
}

export default Games
