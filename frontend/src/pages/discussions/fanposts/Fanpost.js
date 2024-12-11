import React, { useState, useRef, useEffect, useContext } from "react"

import "./fanposts.css"

import { Link, useLocation, useNavigate } from "react-router-dom"

import timeAgo from "../../../functions/timeAgo"
import handleGoToFanpost from "../../../functions/goToFanpost"
import styleText from "../../../functions/styleText"
import changeCoins from "../../../functions/changeCoins"

import loadingImg from "../../../images/loading_screen.png"
import filledHeart from "../../../images/filled_heart.png"

import axios from "axios"

import { v4 as uuidv4 } from "uuid"

import { MdOutlineThumbDownOffAlt } from "react-icons/md"
import { MdOutlineThumbUp } from "react-icons/md"
import { MdThumbUp } from "react-icons/md"
import { MdThumbDown } from "react-icons/md"
import { FaRegTrashAlt } from "react-icons/fa"
import { FaReply } from "react-icons/fa"
import { RiArrowDownSFill } from "react-icons/ri"
import { RiArrowUpSFill } from "react-icons/ri"
import { CiHeart } from "react-icons/ci"

import { Context } from "../../../App"

import sleep from "../../../functions/sleep"

import AddFriend from "../../../components/discussionsComponents/AddFriend"

const dbApiUrl = process.env.REACT_APP_API_URL

function Fanpost({ fanposts, status }) {
  const [isSignedIn] = useContext(Context)
  const userName = useContext(Context)[2]

  const [currentFanposts, setcurrentFanposts] = useState(null)

  const location = useLocation()

  const nextPosts = location.state ? location.state.next5posts : null
  const index = location.state ? location.state.index : null

  const [replyTo, setreplyTo] = useState("")
  const [selectedCommentIndex, setselectedCommentIndex] = useState(null)

  const [showingReplies, setshowingReplies] = useState(() => null)

  useEffect(() => {
    if (status === "success") {
      setshowingReplies(Array(fanposts[index].comments.length).fill(false))
      setcurrentFanposts(fanposts)
    }
  }, [status])

  const [currentOrder, setcurrentOrder] = useState("newest")

  const addCommentRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (replyTo) addCommentRef.current.focus()
  }, [replyTo])

  if (status !== "success")
    return (
      <div className="loading-container">
        <img src={loadingImg} />
        {status === "loading" ? (
          <p>loading...</p>
        ) : (
          <p>Oops... It looks like something went wrong ):</p>
        )}
      </div>
    )

  function handleBlur(e) {
    if (!e.target.value) setreplyTo("")
  }

  function patchFanpostData(newComments, newArray) {
    // start the animation
    const loader = document.querySelector(".fanpost-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/fanposts/" + fanposts[index]._id, {
        comments: newComments,
      })
      .then(async () => {
        setcurrentFanposts(newArray)

        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Couldn't patch fanposts.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  function handleReply(commentIndex, maker) {
    setselectedCommentIndex(commentIndex)
    setreplyTo(maker)
  }

  function handleAddComment(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      if (!checkSignedIn()) return

      const newComments = [...fanposts[index].comments]

      const date = new Date()

      newComments.push({
        content: e.target.value,
        maker: userName,
        date: {
          full_date:
            date.getDate() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getFullYear(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          seconds: date.getSeconds(),
          time: date.getTime(), // for sorting
        },
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        replies: [],
        id: uuidv4(),
      })

      const newFanposts = [...fanposts]
      newFanposts[index].comments = newComments

      patchFanpostData(newComments, newFanposts)

      e.target.value = "" // clear the box
    }
  }

  function handleRemoveComment(commentIndex) {
    const newArray = [...fanposts]

    // adjust replyTo if needed
    if (replyTo === newArray[index].comments[commentIndex].maker) setreplyTo("")

    newArray[index].comments.splice(commentIndex, 1)

    const newComments = newArray[index].comments

    patchCommentsData(newComments, newArray)
  }

  function handleLikeComment(commentIndex) {
    if (!checkSignedIn()) return

    const newComment = fanposts[index].comments[commentIndex]

    // logic to add or remove the like:
    if (newComment.likedBy.includes(userName)) {
      newComment.likes--
      newComment.likedBy.splice(newComment.likedBy.indexOf(userName), 1)
    } else {
      newComment.likes++
      newComment.likedBy.push(userName)
    }

    // logic to remove the dislike if it existed:
    if (newComment.dislikedBy.includes(userName)) {
      newComment.dislikes--
      newComment.dislikedBy.splice(newComment.dislikedBy.indexOf(userName), 1)
    }

    const newArray = [...fanposts]

    newArray[index].comments[commentIndex] = newComment

    const newComments = newArray[index].comments

    patchCommentsData(
      newComments,
      newArray,
      !newComments[commentIndex].likedBy.includes(userName)
        ? "remove like"
        : "add like",
      newComments[commentIndex].maker
    )
  }

  function handleDislikeComment(commentIndex) {
    if (!checkSignedIn()) return

    const newComment = fanposts[index].comments[commentIndex]

    // logic to add or remove the dislike:
    if (newComment.dislikedBy.includes(userName)) {
      newComment.dislikes--
      newComment.dislikedBy.splice(newComment.dislikedBy.indexOf(userName), 1)
    } else {
      newComment.dislikes++
      newComment.dislikedBy.push(userName)
    }

    // logic to remove the like if it existed:
    if (newComment.likedBy.includes(userName)) {
      newComment.likes--
      newComment.likedBy.splice(newComment.likedBy.indexOf(userName), 1)
    }

    const newArray = [...fanposts]

    newArray[index].comments[commentIndex] = newComment

    const newComments = newArray[index].comments

    patchCommentsData(newComments, newArray)
  }

  function patchCommentsData(newComments, newArray, type, maker) {
    // start the animation
    const loader = document.querySelector(".fanpost-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/fanposts/" + fanposts[index]._id, {
        comments: newComments,
      })
      .then(async () => {
        // only change coins if type is set and the liker is not the maker
        if (maker !== userName) {
          if (type === "add like") await changeCoins(maker, 2)
          else if (type === "remove like") await changeCoins(maker, -2)
        }

        setcurrentFanposts(newArray)

        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Couldn't patch comments.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  function handleAddReply(e) {
    if (e.key === "Enter" && e.target.value.trim()) {
      if (!checkSignedIn()) return

      const newReplies = [
        ...fanposts[index].comments[selectedCommentIndex].replies,
      ]

      const date = new Date()

      newReplies.push({
        content: e.target.value,
        maker: userName,
        replyTo: replyTo,
        date: {
          full_date:
            date.getDate() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getFullYear(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          seconds: date.getSeconds(),
          time: date.getTime(), // for sorting
        },
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
      })

      const newFanposts = [...fanposts]
      newFanposts[index].comments[selectedCommentIndex].replies = newReplies

      const newComments = newFanposts[index].comments

      patchCommentsData(newComments, newFanposts)

      e.target.value = "" // clear the box
    }
  }

  function handleRemoveReply(commentIndex, replyIndex) {
    const newArray = [...fanposts]

    newArray[index].comments[commentIndex].replies.splice(replyIndex, 1)

    const newComments = newArray[index].comments

    patchCommentsData(newComments, newArray)
  }

  function handleLikeReply(commentIndex, replyIndex) {
    const newReply = fanposts[index].comments[commentIndex].replies[replyIndex]

    // logic to add or remove the like:
    if (newReply.likedBy.includes(userName)) {
      newReply.likes--
      newReply.likedBy.splice(newReply.likedBy.indexOf(userName), 1)
    } else {
      newReply.likes++
      newReply.likedBy.push(userName)
    }

    // logic to remove the dislike if it existed:
    if (newReply.dislikedBy.includes(userName)) {
      newReply.dislikes--
      newReply.dislikedBy.splice(newReply.dislikedBy.indexOf(userName, 1))
    }

    const newArray = [...fanposts]

    newArray[index].comments[commentIndex].replies[replyIndex] = newReply

    const newComments = newArray[index].comments

    patchCommentsData(
      newComments,
      newArray,
      !newComments[commentIndex].replies[replyIndex].likedBy.includes(userName)
        ? "remove like"
        : "add like",
      newComments[commentIndex].replies[replyIndex].maker
    )
  }

  function handleDislikeReply(commentIndex, replyIndex) {
    if (!checkSignedIn()) return

    const newReply = fanposts[index].comments[commentIndex].replies[replyIndex]

    // logic to add or remove the dislike:
    if (newReply.dislikedBy.includes(userName)) {
      newReply.dislikes--
      newReply.dislikedBy.splice(newReply.likedBy.indexOf(userName), 1)
    } else {
      newReply.dislikes++
      newReply.dislikedBy.push(userName)
    }

    // logic to remove the like if it existed:
    if (newReply.likedBy.includes(userName)) {
      newReply.likes--
      newReply.likedBy.splice(newReply.dislikedBy.indexOf(userName, 1))
    }

    const newArray = [...fanposts]

    newArray[index].comments[commentIndex].replies[replyIndex] = newReply

    const newComments = newArray[index].comments

    patchCommentsData(newComments, newArray)
  }

  function handleToggleShowReply(commentIndex) {
    const newArray = [...showingReplies]
    newArray[commentIndex] = !newArray[commentIndex]

    setshowingReplies(newArray)
  }

  function handleSectionChange(e) {
    setcurrentOrder(e.target.value)
  }

  function getOrederedComments() {
    switch (currentOrder) {
      case "newest":
        return [...currentFanposts[index].comments].sort(
          (a, b) => b.date.time - a.date.time
        )
      case "oldest":
        return [...currentFanposts[index].comments].sort(
          (a, b) => a.date.time - b.date.time
        )
      case "most likes":
        return [...currentFanposts[index].comments].sort(
          (a, b) => b.likes - a.likes
        )
      case "most replies":
        return [...currentFanposts[index].comments].sort(
          (a, b) => b.replies.length - a.replies.length
        )
    }
  }

  function handleLikeFanpost(operator) {
    if (!checkSignedIn()) return

    // start the animation
    const loader = document.querySelector(".fanpost-like-loader")
    loader.style.display = "block"

    if (operator === "like") {
      if (!isSignedIn) {
        alert("You must be logged in to like this post.")
        return
      }

      // add the like:
      const newLikedBy = [...fanposts[index].likedBy]
      newLikedBy.push(userName)
      axios
        .patch(dbApiUrl + "/fanposts/" + fanposts[index]._id, {
          likedBy: newLikedBy,
        })
        .then(async () => {
          // update the coins of the poster

          if (fanposts[index].maker !== userName)
            await changeCoins(fanposts[index].maker, 6)

          // update currently
          setcurrentFanposts((prev) => {
            const newPosts = [...prev]
            newPosts[index].likedBy = newLikedBy
            return newPosts
          })

          // animation handling

          await sleep(150)

          loader.style.color = "green"
          loader.style.animationPlayState = "paused"

          await sleep(250)

          loader.style.animationPlayState = "running"
          loader.style.display = "none"
          loader.style.color = "black"
        })
        .catch(async (err) => {
          console.error("Couldn't like fanpost.", err.message)

          // animation handling

          await sleep(150)

          loader.style.color = "red"
          loader.style.animationPlayState = "paused"

          await sleep(250)

          loader.style.animationPlayState = "running"
          loader.style.display = "none"
          loader.style.color = "black"
        })
    } else {
      // removing the like:
      const newLikedBy = [...fanposts[index].likedBy].filter(
        (name) => name !== userName
      )
      axios
        .patch(dbApiUrl + "/fanposts/" + fanposts[index]._id, {
          likedBy: newLikedBy,
        })
        .then(async () => {
          // update the coins of the poster
          try {
            if (fanposts[index].maker !== userName)
              await changeCoins(fanposts[index].maker, -6)
          } catch (err) {
            console.error("Couldn't patch coins.", err.message)
          }

          // update currently
          setcurrentFanposts((prev) => {
            const newPosts = [...prev]
            newPosts[index].likedBy = newLikedBy
            return newPosts
          })

          // animation handling

          await sleep(150)

          loader.style.color = "green"
          loader.style.animationPlayState = "paused"

          await sleep(250)

          loader.style.animationPlayState = "running"
          loader.style.display = "none"
          loader.style.color = "black"
        })
        .catch(async (err) => {
          console.error("Couldn't unlike fanpost.", err.message)

          // animation handling

          await sleep(150)

          loader.style.color = "red"
          loader.style.animationPlayState = "paused"

          await sleep(250)

          loader.style.animationPlayState = "running"
          loader.style.display = "none"
          loader.style.color = "black"
        })
    }
  }

  function checkSignedIn() {
    if (!isSignedIn) {
      alert("You must be signed in.")
    }

    return isSignedIn
  }

  return (
    <div className="fanpost-page">
      <div className="loader4 fanpost-loader"></div>
      <div className="like-button">
        {!isSignedIn || fanposts[index].likedBy.includes(userName) ? (
          <>
            <p>Remove like</p>
            <img
              src={filledHeart}
              className="heart"
              onClick={() => handleLikeFanpost("remove like")}
            />
          </>
        ) : (
          <>
            <p>Liked this post?</p>
            <CiHeart
              className="heart"
              onClick={() => handleLikeFanpost("like")}
            />
          </>
        )}
        <div
          className="loader4 fanpost-like-loader"
          style={{ marginTop: "10px", display: "none" }}
        ></div>
      </div>
      <div className="post-fanpost-request">
        {isSignedIn ? (
          <p>
            Wanna post your own fanpost?{" "}
            <Link to="/PostFanpost">Click Here!</Link>
          </p>
        ) : (
          <p>
            Wanna post your fanpost? <Link to="/SignIn">Click Here</Link> to
            sign in!
          </p>
        )}
      </div>
      <h1 className="page-title">Fanpost</h1>
      <div className="post-container">
        <div className="title">
          <h1>{fanposts[index].title}</h1>
          <em>
            {timeAgo(
              fanposts[index].date.year,
              fanposts[index].date.month,
              fanposts[index].date.day,
              fanposts[index].date.hour,
              fanposts[index].date.minute
            )}
            , Made by {fanposts[index].maker}
          </em>
        </div>
        <img src={fanposts[index].img_url} className="post-image" />
        <div className="content-container">
          <div className="fanposts-content">
            {styleText(
              fanposts[index].content.value,
              fanposts[index].content.baldIndexes,
              fanposts[index].content.underlineIndexes
            )}
          </div>
        </div>
        <hr className="to-comments-hr" />
      </div>
      <div className="finish-container">
        <div className="comments-container">
          {fanposts[index].comments.length ? (
            <>
              <div className="input-container">
                {replyTo ? (
                  <input
                    placeholder={"Reply to " + replyTo}
                    ref={addCommentRef}
                    onBlur={handleBlur}
                    maxLength={140}
                    onKeyDown={(e) => handleAddReply(e)}
                  />
                ) : (
                  <input
                    placeholder={
                      isSignedIn
                        ? "Add to the conversation"
                        : "Sign in to comment"
                    }
                    onFocus={(e) => !isSignedIn && e.target.blur()}
                    readOnly={!isSignedIn}
                    maxLength={140}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleAddComment(e)}
                  />
                )}
                <div className="section-container">
                  <p>Sort by</p>
                  <section onChange={handleSectionChange}>
                    <select>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most likes">Most likes</option>
                      <option value="most replies">Most replies</option>
                    </select>
                  </section>
                </div>
              </div>
              {currentFanposts &&
                getOrederedComments().map((comment, commentIndex) => (
                  <div key={uuidv4()} className="comment-container">
                    <div className="comment">
                      <span className="date">
                        {timeAgo(
                          comment.date.year,
                          comment.date.month,
                          comment.date.day,
                          comment.date.hour,
                          comment.date.minute
                        )}
                      </span>
                      <span className="maker">
                        <AddFriend
                          name={comment.maker}
                          className="normal comment"
                        />{" "}
                        {comment.maker === fanposts[index].maker && (
                          <span className="is-creator">
                            (<span>creator</span>)
                          </span>
                        )}{" "}
                      </span>
                      <p className="content">{comment.content}</p>
                    </div>
                    <div className="likes-container">
                      {comment.maker === userName && (
                        <button
                          className="remove-comment"
                          onClick={() =>
                            handleRemoveComment(
                              fanposts[index].comments.findIndex(
                                (post) => comment.id === post.id
                              )
                            )
                          }
                        >
                          <FaRegTrashAlt className="like-icon" />
                        </button>
                      )}
                      <div>
                        {comment.likes}
                        <button
                          onClick={() =>
                            handleLikeComment(
                              fanposts[index].comments.findIndex(
                                (post) => comment.id === post.id
                              )
                            )
                          }
                        >
                          {comment.likedBy.includes(userName) ? (
                            <MdThumbUp className="like-icon" />
                          ) : (
                            <MdOutlineThumbUp className="like-icon" />
                          )}
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() =>
                            handleDislikeComment(
                              fanposts[index].comments.findIndex(
                                (post) => comment.id === post.id
                              )
                            )
                          }
                        >
                          {comment.dislikedBy.includes(userName) ? (
                            <MdThumbDown className="like-icon" />
                          ) : (
                            <MdOutlineThumbDownOffAlt className="like-icon" />
                          )}
                        </button>
                        {comment.dislikes}
                      </div>
                      <button
                        className="reply-btn"
                        onClick={() => handleReply(commentIndex, comment.maker)}
                      >
                        <FaReply />
                      </button>
                      <button
                        className="toggle-replies-btn"
                        onClick={() => handleToggleShowReply(commentIndex)}
                      >
                        {comment.replies.length ? (
                          showingReplies[commentIndex] ? (
                            <>
                              Hide replies <RiArrowUpSFill />
                            </>
                          ) : (
                            <>
                              Show replies <RiArrowDownSFill />(
                              {comment.replies.length})
                            </>
                          )
                        ) : (
                          ""
                        )}
                      </button>
                    </div>
                    {comment.replies.length && showingReplies[commentIndex] ? (
                      <div className="reply-container">
                        {comment.replies.map((reply, replyIndex) => (
                          <div key={uuidv4()} className="reply">
                            <div className="comment">
                              <span className="date">
                                {timeAgo(
                                  reply.date.year,
                                  reply.date.month,
                                  reply.date.day,
                                  reply.date.hour,
                                  reply.date.minute
                                )}
                              </span>
                              <p className="maker">
                                {"" + reply.maker}{" "}
                                {reply.maker === fanposts[index].maker && (
                                  <span className="is-creator">
                                    (<span>creator</span>)
                                  </span>
                                )}
                                <span className="replied-to">
                                  to {reply.replyTo}
                                </span>
                              </p>
                              <p className="content">{reply.content}</p>
                            </div>
                            <div className="likes-container">
                              {reply.maker === userName && (
                                <button
                                  className="remove-comment"
                                  onClick={() =>
                                    handleRemoveReply(
                                      fanposts[index].comments.findIndex(
                                        (post) => comment.id === post.id
                                      ),
                                      replyIndex
                                    )
                                  }
                                >
                                  <FaRegTrashAlt className="like-icon" />
                                </button>
                              )}
                              <div>
                                {reply.likes}
                                <button
                                  onClick={() =>
                                    handleLikeReply(
                                      fanposts[index].comments.findIndex(
                                        (post) => comment.id === post.id
                                      ),
                                      replyIndex
                                    )
                                  }
                                >
                                  {reply.likedBy.includes(userName) ? (
                                    <MdThumbUp className="like-icon" />
                                  ) : (
                                    <MdOutlineThumbUp className="like-icon" />
                                  )}
                                </button>
                                <button
                                  className="reply-btn"
                                  onClick={() =>
                                    handleReply(commentIndex, reply.maker)
                                  }
                                >
                                  <FaReply />
                                </button>
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    handleDislikeReply(
                                      fanposts[index].comments.findIndex(
                                        (post) => comment.id === post.id
                                      ),
                                      replyIndex
                                    )
                                  }
                                >
                                  {reply.dislikedBy.includes(userName) ? (
                                    <MdThumbDown className="like-icon" />
                                  ) : (
                                    <MdOutlineThumbDownOffAlt className="like-icon" />
                                  )}
                                </button>
                                {reply.dislikes}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </>
          ) : (
            <>
              <div className="input-container">
                <input
                  placeholder={
                    isSignedIn
                      ? "Start the conversation..."
                      : "Sign in to comment"
                  }
                  readOnly={!isSignedIn}
                  onFocus={(e) => !isSignedIn && e.target.blur()}
                  maxLength={140}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleAddComment(e)}
                />
                <div className="section-container">
                  <p>Sort by</p>
                  <section onChange={handleSectionChange}>
                    <select>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most likes">Most Likes</option>
                      <option value="most replies">Most Replies</option>
                    </select>
                  </section>
                </div>
              </div>
              <p>No comments yet</p>
            </>
          )}
        </div>
        <div className="more-posts-container">
          <h2>More Fanposts</h2>
          {fanposts &&
            nextPosts.map((fanpost) => {
              const nextIndex =
                fanposts.findIndex(
                  (allFanpost) => allFanpost._id === fanpost._id
                ) + 1
              return (
                <a
                  key={uuidv4()}
                  className="link"
                  onClick={() =>
                    handleGoToFanpost(fanpost, nextIndex, fanposts, navigate)
                  }
                >
                  {fanpost.title}
                </a>
              )
            })}
        </div>
      </div>
      <div className="extend-scroll">hi</div>
    </div>
  )
}

export default Fanpost
