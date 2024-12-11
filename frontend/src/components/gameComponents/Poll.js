import React, { useContext } from "react"
import { Context } from "../../App"

function Poll({ poll, options, patchPolls, isPending, pollIndex, isRecap }) {
  const [isSignedIn] = useContext(Context)
  const username = useContext(Context)[2]

  function handleClick(index) {
    if (isSignedIn && patchPolls) {
      if (!poll.all_voters.includes(username))
        patchPolls(
          poll,
          "q" + (pollIndex + 1),
          `option_${index + 1}_votes`,
          pollIndex + "-" + index
        )
    }
    poll.all_voters.push(username) // temporarly add to avoid multiple patches
    poll[`option_${index + 1}_votes`]++ // temporarly add to show the correct number
  }

  function getVotePercentage(votes) {
    const totalVotes = poll.all_voters.length

    return (votes * 100) / totalVotes || 0
  }

  return (
    <div className="poll">
      <h3 className="question">{poll.value}</h3>
      <div className="options">
        {options.map((option, index) => (
          <div
            key={index}
            className={
              "option " +
              (index % 2 === 0 ? "even " : "") +
              (index === 0 ? "first " : "") +
              (index === options.length - 1 ? "last" : "")
            }
          >
            <button
              key={index}
              onClick={() => handleClick(index)}
              style={isRecap ? { cursor: "default" } : {}}
            >
              {option}
            </button>
            <div
              style={{
                display:
                  isPending === pollIndex + "-" + index ? "inline" : "none",
              }}
              className="loader3"
            ></div>
            {(poll.all_voters.includes(username) && !isPending) ||
            isPending === "show results" ? (
              <p className="show-votes">
                {getVotePercentage(poll[`option_${index + 1}_votes`])}% (
                {poll["option_" + (index + 1) + "_votes"]} votes)
              </p>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Poll
