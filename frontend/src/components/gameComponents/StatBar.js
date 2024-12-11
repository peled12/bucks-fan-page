import React, { useState } from "react"

function StatBar({ name, bucksSide, homeStat, awayStat, dotIcon }) {
  const [sumStat] = useState(+awayStat + +homeStat)

  const [awayStatPercent] = useState((awayStat * 100) / sumStat)
  const [homeStatPercent] = useState((homeStat * 100) / sumStat)

  return (
    <div className="stat">
      <p className="name">{name}</p>
      <div>
        <p style={awayStat < homeStat ? { opacity: 0 } : {}}>{dotIcon}</p>
        <div className="stat-bar">
          <div
            style={{ width: awayStatPercent + "%" }}
            className={
              "away-side " + (bucksSide === "left" ? "bucks-side" : "")
            }
          >
            <p>{awayStat}</p>
          </div>
          <div
            style={{ width: homeStatPercent + "%" }}
            className={
              "home-side " + (bucksSide === "right" ? "bucks-side" : "")
            }
          >
            <p>{homeStat}</p>
          </div>
        </div>
        <p style={homeStat < awayStat ? { opacity: 0 } : {}}>{dotIcon}</p>
      </div>
    </div>
  )
}

export default StatBar
