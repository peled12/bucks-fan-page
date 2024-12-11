import React from "react"

function RosterSpot({
  man,
  index,
  addToRoster,
  removeFromRoster,
  alt,
  manType,
}) {
  return (
    <div onClick={() => addToRoster(manType, index)}>
      {man ? (
        <img
          src={man.img_url}
          onClick={() =>
            removeFromRoster && removeFromRoster(man.name, manType)
          }
        />
      ) : (
        <p>{alt}</p>
      )}
    </div>
  )
}

export default RosterSpot
