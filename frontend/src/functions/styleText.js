import React from "react"

export default function styleText(
  displayingContent,
  baldIndexes,
  underlineIndexes
) {
  return displayingContent.split("").map((char, index) => {
    if (char === "\n")
      return (
        <div key={index} className="break-line">
          <br />
        </div>
      )
    if (char === "\t") return <span key={index} className="tab"></span>
    if (baldIndexes.includes(index) && underlineIndexes.includes(index))
      return (
        <b key={index}>
          <u>{char}</u>
        </b>
      )
    else if (baldIndexes.includes(index)) return <b key={index}>{char}</b>
    else if (underlineIndexes.includes(index)) return <u key={index}>{char}</u>
    else return <span key={index}>{char}</span>
  })
}
