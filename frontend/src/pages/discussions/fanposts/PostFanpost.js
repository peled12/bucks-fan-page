import React, { useState, useEffect, useRef, useContext } from "react"

import { useNavigate } from "react-router-dom"

import styleText from "../../../functions/styleText"

import axios from "axios"

import "./fanposts.css"

import { Context } from "../../../App"

import UploadImg from "../../../components/userInputComponents/UploadImg"

const dbApiUrl = process.env.REACT_APP_API_URL

function PostFanpost() {
  const userName = useContext(Context)[2]

  const [title, settitle] = useState("")
  const [subTitle, setsubTitle] = useState("")
  const [content, setcontent] = useState("")
  const [displayingContent, setdisplayingContent] = useState("")

  // content displaying styling states:
  const [isBalding, setisBalding] = useState(false)
  const [isUnderlining, setisUnderlining] = useState(false)

  const [baldIndexes, setbaldIndexes] = useState([])
  const [underlineIndexes, setunderlineIndexes] = useState([])

  const [isTitleInputFocused, setisTitleInputFocused] = useState(false)
  const [isSubTitleInputFocused, setisSubTitleInputFocused] = useState(false)

  const [imgUrl, setimgUrl] = useState("")

  const textareaRef = useRef(null)

  const titleInputLabelRef = useRef(null)
  const subTitleInputLabelRef = useRef(null)

  const separatorRef = useRef(null)

  const navigate = useNavigate()

  function postFanpost() {
    const postMsg = document.querySelector(".post-msg")

    function handleAnimation(msg) {
      const postMsg = document.querySelector(".post-msg")

      // remove the transition
      postMsg.style.transition = "none"
      postMsg.style.opacity = 1

      postMsg.textContent = msg

      void postMsg.offsetWidth

      // apply the transition
      postMsg.style.transition = "6s ease-in-out 2s"
      postMsg.style.opacity = 0
    }

    // posting limitations:
    if (!title) {
      handleAnimation("Make sure to add a title...")
      return
    }
    if (!subTitle) {
      handleAnimation("Please add a short subtitle...")
      return
    }
    if (displayingContent.length < 10) {
      handleAnimation("Add some more content...")
      return
    }
    if (displayingContent > 1400) {
      handleAnimation("Max 1400 characters")
      return
    }

    // add neccesary closing tags:
    postMsg.textContent = "..."

    const currentDate = new Date()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const day = currentDate.getDate()
    const hour = currentDate.getHours()
    const minute = currentDate.getMinutes()
    const second = currentDate.getSeconds()
    const time = currentDate.getTime()
    const fullDate = day + "-" + month + "-" + year

    axios
      .post(dbApiUrl + "/fanposts", {
        maker: userName,
        title: title,
        sub_title: subTitle,
        content: {
          value: displayingContent,
          baldIndexes: baldIndexes,
          underlineIndexes: underlineIndexes,
        },
        img_url: imgUrl,
        comments: [],
        likedBy: [],
        date: {
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          fullDate: fullDate,
          time: time,
        },
      })
      .then(() => {
        cleanupPosting() // reset variables

        handleAnimation("Posted!")

        setTimeout(() => navigate("/Fanposts"), 500) // navigate back to the fanposts page
      })
      .catch((err) => {
        console.error("Couldn't post fanpost.", err)

        handleAnimation(
          "Problem posting... Please check your internet" +
            (imgUrl && " or change an image")
        )
      })

    function cleanupPosting() {
      setcontent("")
      setdisplayingContent("")
      settitle("")
      setsubTitle("")
      setimgUrl("")
      setisUnderlining(false)
      setisBalding(false)
    }
  }

  function handleTitleChange(e) {
    settitle(e.target.value)
  }

  function handleSubTitleChange(e) {
    setsubTitle(e.target.value)
  }

  function handleContentChange(e) {
    // dont allow the arrow left key
    if (!e.nativeEvent.data !== "<") {
      const value = e.target.value
      setdisplayingContent(value)

      // ununderline and unbald if there is no content:
      if (!value) {
        setisBalding(false)
        setisUnderlining(false)
      }

      setcontent((prev) => {
        // init:
        const tagsIndexes = [
          getIndexesOfSubstring(prev, "<u>"), // indexes for <u>
          getIndexesOfSubstring(prev, "</u>"), // indexes for </u>
          getIndexesOfSubstring(prev, "<b>"), // indexes for <b>
          getIndexesOfSubstring(prev, "</b>"), // indexes for </b>
        ]
        const tags = ["<u>", "</u>", "<b>", "</b>"]
        // init result:
        let result = ""

        for (let i = 0; i <= value.length; i++) {
          // <= so it will add a tag in the end
          for (let tagIndex = 0; tagIndex < tagsIndexes.length; tagIndex++) {
            // add tags if needed:
            if (tagsIndexes[tagIndex].includes(i))
              // add the tag
              result += tags[tagIndex]
          }
          if (i !== value.length) result += value[i] // add the character
        }

        return result
      })

      function getIndexesOfSubstring(mainString, substring) {
        // get the indexes from prev:
        const regex = new RegExp(substring, "g")
        const matches = [...mainString.matchAll(regex)]
        const indexes = matches.map((match) => match.index)

        // to adjust the indexes to fit value instead of prev:
        for (let i = 0; i < indexes.length; i++) {
          const tillIndexStr = mainString.substring(0, indexes[i])

          // substarct the length of starting tags times the amount:
          const startingMatches = tillIndexStr.match(/<(b|u)>/g)
          const staringTags = startingMatches ? startingMatches.length : 0

          indexes[i] -= staringTags * 3 // the length of a starting tag

          // substarct the length of ending tags times the amount:
          const endingMatches = tillIndexStr.match(/<\/(b|u)>/g)
          const endingTags = endingMatches ? endingMatches.length : 0

          indexes[i] -= endingTags * 4 // the length of an ending tag
        }

        return indexes
      }
    }
  }

  function handleBaldingClick() {
    setcontent((prev) => (isBalding ? prev + "</b>" : prev + "<b>"))

    setisBalding((prev) => !prev)

    textareaRef.current.focus() // immediately focus the texarea back
  }

  function handleUnderliningClick() {
    setcontent((prev) => (isUnderlining ? prev + "</u>" : prev + "<u>"))

    setisUnderlining((prev) => !prev)

    textareaRef.current.focus() // immediately focus the texarea back
  }

  // useEffect to update the bolded or underlined indexes:
  useEffect(() => {
    const indexesB = []
    const indexesU = []

    // for the b tag:
    const regexB = /<b>(.*?)<\/b>/g
    //const noUcontent = content.replace(/<\/?u>/g, "")

    let matchB
    // loop through all the matches:
    while ((matchB = regexB.exec(content)) !== null) {
      const startIndex = getTrueStart(matchB.index)
      const endIndex = startIndex + getNoTagEdgesStr(matchB[1]).length

      // push the indexes
      for (let i = startIndex; i < endIndex; i++) {
        // skip the u tags:
        if (content[i] + content[i + 1] + content[i + 2] === "<u>") i += 3
        if (
          content[i] + content[i + 1] + content[i + 2] + content[i + 3] ===
          "</u>"
        )
          i += 4

        indexesB.push(i)
      }
    }
    if (isLastTagOpen("<b>", "</b>")) {
      // apply for indexes after <b> that dont have </b> after:
      const regexB2 = /<b>(?![\s\S]*<\/b>)/g
      let matchB2

      while ((matchB2 = regexB2.exec(content)) !== null) {
        const startIndex = getTrueStart(matchB2.index)
        const endIndex = content.length

        // push the  indexes
        for (let i = startIndex; i < endIndex; i++) {
          // skip the u tags:
          if (content[i] + content[i + 1] + content[i + 2] === "<u>") i += 3
          if (
            content[i] + content[i + 1] + content[i + 2] + content[i + 3] ===
            "</u>"
          )
            i += 4

          indexesB.push(i)
        }
      }
    }

    // for the u tag:
    const regexU = /<u>(.*?)<\/u>/g
    //const noBcontent = content.replace(/<\/?b>/g, "")

    let matchU
    // loop through all the matches:
    while ((matchU = regexU.exec(content)) !== null) {
      const startIndex = getTrueStart(matchU.index)
      const endIndex = startIndex + getNoTagEdgesStr(matchU[1]).length

      // push the indexes
      for (let i = startIndex; i < endIndex; i++) {
        // skip the b tags:
        if (content[i] + content[i + 1] + content[i + 2] === "<b>") i += 3
        if (
          content[i] + content[i + 1] + content[i + 2] + content[i + 3] ===
          "</b>"
        )
          i += 4
        indexesU.push(i)
      }
    }
    if (isLastTagOpen("<u>", "</u>")) {
      // apply for indexes after <u> that dont have </u> after:
      const regexU2 = /<u>(?![\s\S]*<\/u>)/g
      let matchU2

      while ((matchU2 = regexU2.exec(content)) !== null) {
        const startIndex = getTrueStart(matchU2.index)
        const endIndex = content.length

        // push the  indexes
        for (let i = startIndex; i < endIndex; i++) {
          // skip the b tags:
          if (content[i] + content[i + 1] + content[i + 2] === "<b>") i += 3
          if (
            content[i] + content[i + 1] + content[i + 2] + content[i + 3] ===
            "</b>"
          )
            i += 4

          indexesU.push(i)
        } // push the indexes
      }
    }
    // adjust the indexes to fit displayingContent instead of content:
    adjustIndex(indexesB) // for b tags
    adjustIndex(indexesU) // for u tags

    function adjustIndex(array) {
      for (let i = 0; i < array.length; i++) {
        const tillIndexStr = content.substring(0, array[i])

        // substarct the length of starting tags times the amount:
        const startingMatches = tillIndexStr.match(/<(b|u)>/g)
        const startingTags = startingMatches ? startingMatches.length : 0

        array[i] -= startingTags * 3 // the length of a staring tag

        // substarct the length of ending tags times the amount:
        const endingMatches = tillIndexStr.match(/<\/(b|u)>/g)
        const endingTags = endingMatches ? endingMatches.length : 0

        array[i] -= endingTags * 4 // the length of an ending tag
      }
    }

    // assisting functions:

    function getTrueStart(initIndex) {
      const str = content.slice(initIndex)
      const regex = /(<\/?u>)|(<\/?b>)/g
      let index = 0
      let match

      while ((match = regex.exec(str)) !== null) {
        const tag = match[0]
        const tagLength = tag.length

        if (index === match.index) index += tagLength
        else break
      }

      index += initIndex

      return index
    }

    function getNoTagEdgesStr(str) {
      const startRegex = /^(<b>|<u>)/
      const endRegex = /(<\/b>|<\/u>)$/

      let modifiedStr = str

      // Remove start tags
      modifiedStr = modifiedStr.replace(startRegex, "")

      // Remove end tags
      modifiedStr = modifiedStr.replace(endRegex, "")

      return modifiedStr
    }

    function isLastTagOpen(startingTag, endingTag) {
      const lastStartIndex = content.lastIndexOf(startingTag)
      const lastEndingIndex = content.lastIndexOf(endingTag)

      // return, order matters:
      if (lastStartIndex === -1) return false
      if (lastEndingIndex === -1) return true
      return lastStartIndex > lastEndingIndex
    }

    //

    setbaldIndexes(indexesB)
    setunderlineIndexes(indexesU)
  }, [displayingContent])

  // styling functions:

  function autoAdjustHeight(e) {
    // add a tab if needed:
    if (e.key === "Tab") {
      e.preventDefault() // dont focus on to the next input

      setdisplayingContent((prev) => (prev += "\t"))
    }

    const textarea = e.target
    const computedStyle = window.getComputedStyle(textarea)

    // logic to know if the last row is empty:
    let lastIndex = content.lastIndexOf("\n")
    if (lastIndex === -1) lastIndex = 0
    const subStringAfterLast = content.substring(lastIndex + "\n".length)
    const isLastRowEmpty = subStringAfterLast === ""

    if (e.key === "Enter" || (e.key === "Backspace" && isLastRowEmpty))
      if (
        textarea.scrollHeight >=
        parseFloat(computedStyle.getPropertyValue("height"))
      )
        textarea.style.height = textarea.clientHeight + 17 + "px"
      else textarea.style.height = textarea.clientHeight - 17 + "px"
  }

  return (
    <div className="post-fanpost">
      <h1 className="page-title" style={{ right: ".5vw" }}>
        Post Fanpost
      </h1>
      <button className="post-btn" onClick={postFanpost}>
        Post
      </button>
      <div className="post-fanpost-all-container post-fanpost-container">
        <div className="titles-container">
          <div className="title-container">
            <div>
              <input
                className="title-input"
                value={title}
                onChange={handleTitleChange}
                maxLength={40}
                id="title-input"
                onFocus={() => {
                  titleInputLabelRef.current.classList.add("active")
                  setisTitleInputFocused(true)
                }}
                onBlur={() => {
                  if (!title)
                    titleInputLabelRef.current.classList.remove("active")
                  setisTitleInputFocused(false)
                }}
              />
              <label
                htmlFor="title-input"
                className={title || isTitleInputFocused ? "active" : ""}
                ref={titleInputLabelRef}
              >
                Type the title here
              </label>
            </div>
            <div>
              <input
                className="title-input sub-title-input"
                value={subTitle}
                onChange={handleSubTitleChange}
                maxLength={50}
                id="sub-title-input"
                onFocus={() => {
                  subTitleInputLabelRef.current.classList.add("active")
                  setisSubTitleInputFocused(true)
                }}
                onBlur={() => {
                  if (!subTitle)
                    subTitleInputLabelRef.current.classList.remove("active")
                  setisSubTitleInputFocused(false)
                }}
              />
              <label
                htmlFor="sub-title-input"
                className={subTitle || isSubTitleInputFocused ? "active" : ""}
                ref={subTitleInputLabelRef}
              >
                Type the sub title here
              </label>
            </div>
          </div>
          <div className="displaying-titles">
            <h1 className="title">{title}</h1>
            <h3 className="sub-title">{subTitle}</h3>
          </div>
        </div>
        <div className="images-container">
          <UploadImg imgUrl={imgUrl} setimgUrl={setimgUrl} />
          <div className="page-separator" ref={separatorRef}></div>
          {imgUrl ? (
            <img className="post-image" src={imgUrl} alt="post image" />
          ) : (
            <div className="temp-to-img">The image would be displayed here</div>
          )}
        </div>
        <div className="content-container">
          <div className="textarea-container">
            <textarea
              className="title-textarea"
              value={displayingContent}
              onKeyDown={autoAdjustHeight}
              onChange={handleContentChange}
              placeholder="Enter the content here..."
              ref={textareaRef}
            />
            <div className="btns-container">
              <button
                className={"balding-btn " + (isBalding ? "active" : "")}
                onClick={handleBaldingClick}
              >
                B
              </button>
              <button
                className={"underlining-btn " + (isUnderlining ? "active" : "")}
                onClick={handleUnderliningClick}
              >
                U
              </button>
            </div>
            <div className="character-counter">{displayingContent.length}</div>
          </div>
          <div className="displaying-content">
            <p className="fanposts-content">
              {styleText(displayingContent, baldIndexes, underlineIndexes)}
            </p>
          </div>
        </div>
        <div className="post-fanpost-template post-container"></div>
      </div>
      <div className="post-msg"></div>
    </div>
  )
}

export default PostFanpost
