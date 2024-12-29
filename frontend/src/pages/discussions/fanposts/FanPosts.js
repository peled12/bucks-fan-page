import React, { useState, useContext, useEffect } from "react"

import { useNavigate } from "react-router-dom"

import "./fanposts.css"

import loadingImg from "../../../images/loading_screen.png"

import handleGoToFanpost from "../../../functions/goToFanpost"

import { IoSearchSharp } from "react-icons/io5"

import axios from "axios"

import { v4 as uuidv4 } from "uuid"

import { Link } from "react-router-dom"

import timeAgo from "../../../functions/timeAgo"
import refetch from "../../../functions/refetch"

import { Context } from "../../../App"
import AddFriend from "../../../components/discussionsComponents/AddFriend"
import sleep from "../../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function Fanposts({ fanposts, status, refetchFanposts }) {
  const [isSignedIn] = useContext(Context)
  const userName = useContext(Context)[2]

  const [displayingFanposts, setdisplayingFanposts] = useState(null)

  useEffect(() => {
    if (status === "success") setdisplayingFanposts(fanposts)
  }, [fanposts])

  const [query, setquery] = useState("") // use this to search fanpost

  const navigate = useNavigate()

  function handleQueryChange(e) {
    const value = e.target.value

    setquery(value)

    // change the displaying fanposts:
    setdisplayingFanposts(() =>
      fanposts.filter((post) =>
        post.title.toLowerCase().includes(value.toLowerCase())
      )
    )
  }

  function handleDeleteFanpost(id) {
    // update displayingFanposts:
    const newArray = [...fanposts]
    const updatedArray = newArray.filter(
      (idea) => JSON.stringify(idea._id) !== JSON.stringify(id)
    )
    setdisplayingFanposts(updatedArray)

    // start the animation
    const loader = document.querySelector(".all-fanposts-loader")
    loader.style.display = "block"

    // update in the db:
    axios
      .delete(dbApiUrl + "/fanposts/" + id)
      .then(async () => {
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
        console.error("Couldn't delete fanpost.", err.message)

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

  return (
    <div className="all-fanposts-page">
      <h1 className="page-title">Fanposts</h1>
      <div className="loader4 all-fanposts-loader"></div>
      <button
        className="refetch-btn"
        onClick={() =>
          refetch(
            refetchFanposts,
            document.querySelector(".all-fanposts-loader")
          )
        }
      >
        Refetch
      </button>
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
      {displayingFanposts ? (
        <>
          <div className="all-fanposts-container">
            <div className="title-container">
              <div className="name-container">
                <h2 className="title-name">Recent Fanposts</h2>
              </div>
              <div className="search-container">
                <input
                  value={query}
                  placeholder="Search Fanposts"
                  onChange={handleQueryChange}
                  maxLength={30}
                />
                <button>
                  <IoSearchSharp />
                </button>
              </div>
            </div>
            <div className="fanposts-container">
              <div className="titles">
                <h2 className="subject-title">Subject</h2>
                <h2 className="comments-title">Interactions Rec</h2>
              </div>
              {fanposts ? (
                displayingFanposts.length ? (
                  displayingFanposts.map((post, index) => (
                    <div
                      key={uuidv4()}
                      className={
                        "fanpost-link-container " +
                        (index === displayingFanposts.length - 1
                          ? "last-fanpost "
                          : "") +
                        (index % 2 === 0 ? "even" : "")
                      }
                    >
                      <div className="left-container">
                        <a
                          onClick={() =>
                            handleGoToFanpost(
                              post,
                              index + 1,
                              fanposts,
                              navigate
                            )
                          }
                          className="link"
                        >
                          {post.title}
                        </a>
                        <em className="credit-user-container">
                          Posted by <AddFriend name={post.maker} />{" "}
                          {timeAgo(
                            post.date.year,
                            post.date.month,
                            post.date.day,
                            post.date.hour,
                            post.date.minute
                          )}
                        </em>
                      </div>
                      <div className="right-container all">
                        <p className="comments-num">
                          {post.comments.length}{" "}
                          {post.comments.length === 1 ? "Comment" : "Comments"}{" "}
                          /
                          <br /> {post.likedBy.length}{" "}
                          {post.likedBy.length === 1 ? "Like" : "Likes"}
                        </p>
                        {post.maker === userName && (
                          <button
                            className="remove-fanpost-btn all"
                            onClick={() => handleDeleteFanpost(post._id)}
                          >
                            DEL
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-fanposts-msg">
                    No fanposts match this search
                  </p>
                )
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
          <div className="page-expandor">hi</div>
        </>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} alt="loading" />
          {status === "loading" ? (
            <p>Loading...</p>
          ) : (
            <p>It looks like we have a problem. try again later!</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Fanposts
