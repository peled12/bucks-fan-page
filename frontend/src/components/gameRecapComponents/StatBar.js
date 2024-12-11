import React, { useState } from "react"

function StatBar({ name, game, statName }) {
  const [bucksSide] = useState(game.home === "MIL" ? "right" : "left")

  const [awayStat] = useState(game.teamStats[game.away][statName])
  const [homeStat] = useState(game.teamStats[game.home][statName])

  const [sumStat] = useState(+awayStat + +homeStat)

  const [awayStatPercent] = useState((awayStat * 100) / sumStat)
  const [homeStatPercent] = useState((homeStat * 100) / sumStat)

  return (
    <div className="stat">
      <p>{name}</p>
      <div className="stat-bar">
        <div
          style={{ width: awayStatPercent + "%" }}
          className={"away-side " + (bucksSide === "left" ? "bucks-side" : "")}
        >
          <p>{awayStat}</p>
        </div>
        <div
          style={{ width: homeStatPercent + "%" }}
          className={"home-side " + (bucksSide === "right" ? "bucks-side" : "")}
        >
          <p>{homeStat}</p>
        </div>
      </div>
    </div>
  )
}

export default StatBar
