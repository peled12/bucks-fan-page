import React from "react"

function BoxScore({ playerStats, currentlyPlaying, teamAbv }) {
  function shortenName(name) {
    const words = name.trim().split(" ")

    const firstLetter = words[0][0]
    const restOfTheName = words.filter((_, index) => index > 0).join(" ")

    return firstLetter + ". " + restOfTheName
  }

  return (
    <>
      <h1 className="box-score-title">{teamAbv}</h1>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Mins</th>
            <th>Pts</th>
            <th>Reb</th>
            <th>Ast</th>
            <th>Stl</th>
            <th>Blk</th>
            <th>FGA</th>
            <th>FGM</th>
            <th>3PTA</th>
            <th>3PTM</th>
            <th>TOV</th>
            <th>FTA</th>
            <th>FTM</th>
            <th>PF</th>
            <th>+/-</th>
          </tr>
        </thead>
        <tbody>
          {playerStats.map(([playerID, player], index) => (
            <tr
              key={index}
              className={index === playerStats.length - 1 ? "last" : ""}
            >
              <td className="name">
                <div>
                  {currentlyPlaying.includes(playerID) ? (
                    <div className="currently-playing-dot"></div>
                  ) : (
                    ""
                  )}
                  <p>{shortenName(player.longName)}</p>
                </div>
              </td>
              <td>{player.mins}</td>
              <td>{player.pts}</td>
              <td>{player.reb}</td>
              <td>{player.ast}</td>
              <td>{player.stl}</td>
              <td>{player.blk}</td>
              <td>{player.fga}</td>
              <td>{player.fgm}</td>
              <td>{player.tptfga}</td>
              <td>{player.tptfgm}</td>
              <td>{player.TOV}</td>
              <td>{player.fta}</td>
              <td>{player.ftm}</td>
              <td>{player.PF}</td>
              <td>{player.plusMinus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default BoxScore
