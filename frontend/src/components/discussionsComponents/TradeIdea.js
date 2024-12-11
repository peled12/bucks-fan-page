import React, { useState, useRef, useEffect, useContext } from "react"

import { v4 as uuidv4 } from "uuid"

import timeAgo from "../../functions/timeAgo"

import { MdOutlineThumbDownOffAlt } from "react-icons/md"
import { MdOutlineThumbUp } from "react-icons/md"
import { MdThumbUp } from "react-icons/md"
import { MdThumbDown } from "react-icons/md"
import { FaRegTrashAlt } from "react-icons/fa"
import { TbHttpDelete } from "react-icons/tb"
import { FaReply } from "react-icons/fa"
import { RiArrowDownSFill } from "react-icons/ri"
import { RiArrowUpSFill } from "react-icons/ri"

import { Context } from "../../App"

import AddFriend from "./AddFriend"

function TradeIdea({
  index,
  tradeIdea,
  isFirst,
  like,
  dislike,
  liked,
  disliked,
  handleAddComment,
  handleRemoveComment,
  handleLikeComment,
  handleDislikeComment,
  deleteIdea,
  handleAddReply,
  handleRemoveReply,
  handleLikeReply,
  handleDislikeReply,
}) {
  const [isSignedIn] = useContext(Context)
  const userName = useContext(Context)[2]

  const [replyTo, setreplyTo] = useState("")
  const [selectedCommentIndex, setselectedCommentIndex] = useState(-1) // for replying
  const [showingReplies, setshowingReplies] = useState(
    Array(tradeIdea.comments.length).fill(false)
  )

  const [currentOrder, setcurrentOrder] = useState("newest")

  const addCommentRef = useRef(null)

  useEffect(() => {
    if (replyTo) addCommentRef.current.focus()
  }, [replyTo])

  function handleReply(index, maker) {
    setselectedCommentIndex(index)
    setreplyTo(maker)
  }

  function handleToggleShowReply(index) {
    const newArray = [...showingReplies]
    newArray[index] = !newArray[index]

    setshowingReplies(newArray)
  }

  function handleBlur(e) {
    if (!e.target.value) setreplyTo("")
  }

  function handleSectionChange(e) {
    setcurrentOrder(e.target.value)
  }

  function getOrderedComments() {
    switch (currentOrder) {
      case "newest":
        return [...tradeIdea.comments].sort((a, b) => b.date.time - a.date.time)
      case "oldest":
        return [...tradeIdea.comments].sort((a, b) => a.date.time - b.date.time)
      case "most likes":
        return [...tradeIdea.comments].sort((a, b) => b.likes - a.likes)
      case "most replies":
        return [...tradeIdea.comments].sort(
          (a, b) => b.replies.length - a.replies.length
        )
    }
  }

  return (
    <>
      <div className={`trade-container ${isFirst && "first-trade-container"}`}>
        <div className="teams">
          {tradeIdea.teams_involved.map((team) => (
            <div key={uuidv4()}>
              <h2 className="team-title">{team.name} get:</h2>
              <ul>
                {team.get.map((asset) => (
                  <li key={uuidv4()}>{asset}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="description-container">
          <p>{tradeIdea.description}</p>
          <div className="likes-container">
            <div>
              {tradeIdea.likes}
              <div className="like-icon">
                <button onClick={like}>
                  {liked ? <MdThumbUp /> : <MdOutlineThumbUp />}
                </button>
              </div>
            </div>
            <div>
              <div className="like-icon">
                <button onClick={dislike}>
                  {disliked ? <MdThumbDown /> : <MdOutlineThumbDownOffAlt />}
                </button>
              </div>
              {tradeIdea.dislikes}
            </div>
          </div>
        </div>
        <div className="comments-container">
          {tradeIdea.comments.length ? (
            <>
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
              {replyTo ? (
                <input
                  placeholder={"Reply to " + replyTo}
                  ref={addCommentRef}
                  onBlur={handleBlur}
                  maxLength={75}
                  onKeyDown={(e) =>
                    handleAddReply(
                      e,
                      index,
                      selectedCommentIndex,
                      tradeIdea._id,
                      replyTo
                    )
                  }
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
                  maxLength={75}
                  onKeyDown={(e) => handleAddComment(e, index, tradeIdea._id)}
                  onBlur={handleBlur}
                />
              )}
              {getOrderedComments().map((comment, commentIndex) => (
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
                      <span>{comment.maker}</span>
                      {comment.maker === tradeIdea.maker && (
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
                            index,
                            tradeIdea.comments.findIndex(
                              (idea) => comment.id === idea.id
                            ),
                            tradeIdea._id
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
                            index,
                            tradeIdea.comments.findIndex(
                              (idea) => comment.id === idea.id
                            ),
                            tradeIdea._id
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
                            index,
                            tradeIdea.comments.findIndex(
                              (idea) => comment.id === idea.id
                            ),
                            tradeIdea._id
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
                      onClick={() =>
                        handleReply(
                          tradeIdea.comments.findIndex(
                            (idea) => comment.id === idea.id
                          ),
                          comment.maker
                        )
                      }
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
                              {reply.maker === tradeIdea.maker && (
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
                                    index,
                                    tradeIdea.comments.findIndex(
                                      (idea) => comment.id === idea.id
                                    ),
                                    replyIndex,
                                    tradeIdea._id
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
                                    index,
                                    tradeIdea.comments.findIndex(
                                      (idea) => comment.id === idea.id
                                    ),
                                    replyIndex,
                                    tradeIdea._id
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
                                    index,
                                    tradeIdea.comments.findIndex(
                                      (idea) => comment.id === idea.id
                                    ),
                                    replyIndex,
                                    tradeIdea._id
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
              <input
                placeholder={
                  isSignedIn
                    ? "Start the conversation..."
                    : "Sign in to comment"
                }
                readOnly={!isSignedIn}
                onFocus={(e) => !isSignedIn && e.target.blur()}
                maxLength={75}
                onBlur={handleBlur}
                onKeyDown={(e) => handleAddComment(e, index, tradeIdea._id)}
              />
              <p>No comments yet</p>
            </>
          )}
        </div>
      </div>
      <div className="bottom-container">
        <span className="trade-creator">
          By:
          <AddFriend name={tradeIdea.maker} />
        </span>
        <p className="trade-date">
          Published{" "}
          {timeAgo(
            tradeIdea.date.year,
            tradeIdea.date.month,
            tradeIdea.date.day,
            tradeIdea.date.hour,
            tradeIdea.date.minute
          )}
        </p>
        {userName === tradeIdea.maker && (
          <button
            className="delete-idea"
            onClick={() => deleteIdea(tradeIdea._id)}
          >
            <TbHttpDelete />
          </button>
        )}
      </div>
      <hr className="trade-hr" />
    </>
  )
}

export default TradeIdea
