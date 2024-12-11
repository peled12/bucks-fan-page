import React, { useState, useEffect, useRef, useContext } from "react"
import "./registration.css"
import "../discussions/fanposts/fanposts.css"

import { useQuery } from "react-query"

import { Link, useNavigate } from "react-router-dom"

import { v4 as uuidv4 } from "uuid"

import { BiSolidShow, BiSolidHide } from "react-icons/bi"
import { IoSearchSharp } from "react-icons/io5"
import { IoArrowForwardSharp } from "react-icons/io5"
import { IoArrowBack } from "react-icons/io5"

import timeAgo from "../../functions/timeAgo"
import handleGoToFanpost from "../../functions/goToFanpost"

import axios from "axios"
import ProfilePic from "../../components/userInputComponents/ProfilePic"

import { Context } from "../../App"
import sleep from "../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function Profile({
  setpassword,
  password,
  email,
  allFanposts,
  fanpostsStatus,
}) {
  const userName = useContext(Context)[2]

  const navigate = useNavigate()

  const [showPass, setshowPass] = useState(false)

  const [newPassword, setnewPassword] = useState(password)

  const [profilePicUrl, setprofilePicUrl] = useState(null)

  const user = useContext(Context)[8]
  useEffect(() => {
    if (user) setprofilePicUrl(user.profile_pic_url)
  }, [user])

  const [isValidNewPw, setisValidNewPw] = useState(true)

  const [query, setquery] = useState("")

  const [displayingPosts, setdisplayingPosts] = useState("fanposts")

  const [userFanposts, setuserFanposts] = useState(null)
  const [displayingFanposts, setdisplayingFanposts] = useState(null)

  useEffect(() => {
    if (allFanposts) {
      const userPosts = allFanposts.filter((post) => post.maker === userName)
      setuserFanposts(userPosts)
      setdisplayingFanposts(userPosts)
    }
  }, [allFanposts])

  const [userTradeIdeas, setuserTradeIdeas] = useState(null)
  const [displayingTradeIdeas, setdisplayingTradeIdeas] = useState(null)

  const { status: tradeIdeasStatus } = useQuery({
    queryKey: ["userTradeIdeas"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      axios
        .get(dbApiUrl + "/tradeIdeas/" + userName)
        .then((res) => {
          setuserTradeIdeas(res.data)
          setdisplayingTradeIdeas(res.data)
        })
        .catch((err) => {
          console.error("Failed to get user's trade ideas.", err.message)
        })
    },
  })

  function handleQueryChange(e, type) {
    const value = e.target.value

    setquery(value)

    switch (type) {
      case "fanposts":
        setdisplayingFanposts(
          userFanposts.filter((post) => post.title.includes(value))
        )
        break

      case "trade ideas":
        setdisplayingFanposts(
          userFanposts.filter((post) => post.title.includes(value))
        )
        break
    }
  }

  const [displayingIndexes, setdisplayingIndexes] = useState("0-3")

  const newPasswordRef = useRef()

  const updatedMsgRef = useRef(null)

  function updateAccont() {
    const msg = updatedMsgRef.current

    // remove the prev animation:
    clearTimeout(msg.animationTimeout)
    msg.classList.remove("showUpdatedAccountMsg")

    void msg.offsetWidth

    axios
      .patch(dbApiUrl + "/users/user/" + userName, {
        password: newPassword,
      })
      .then(() => {
        setpassword(newPassword)

        // set up the new animation:
        msg.classList.add("showUpdatedAccountMsg")
        msg.animationTimeout = setTimeout(
          () => msg.classList.remove("showUpdatedAccountMsg"),
          8000
        )
      })
      .catch((err) => {
        console.error("failed patching user", err.message)
      })
  }

  const [isInitCount, setisInitCount] = useState(0)

  useEffect(() => {
    // count 2 initial mounts: one initialy and one after
    // profilePic is initialy changed
    if (isInitCount < 2) {
      setisInitCount((prev) => prev + 1)
      return
    }

    // start the animation
    const loader = document.querySelector(".profile-page-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/users/user/" + userName, {
        profile_pic_url: profilePicUrl,
      })
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
        console.error("failed patching user", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }, [profilePicUrl])

  function getPwError() {
    return (
      <p>
        {newPassword.length < 6 && <>Password must be at least 6 characters</>}
        {!/[A-Z]/.test(newPassword) && (
          <>
            <br />
            Password must contain at least 1 capital letter
          </>
        )}
        {!/\d/.test(newPassword) && (
          <>
            <br />
            Password must have at least 1 number
          </>
        )}
      </p>
    )
  }

  function handleClick() {
    setshowPass((prev) => !prev)
  }

  // handle pw error validation:
  useEffect(() => {
    if (
      newPassword.length < 6 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    )
      setisValidNewPw(false)
    else setisValidNewPw(true)
  }, [newPassword])

  function handleSubmit(e) {
    e.preventDefault()

    // check if valid password:
    if (
      newPassword.length < 6 ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    )
      return

    if (password !== newPassword) {
      newPasswordRef.current.blur() // unfocus
      updateAccont()
    }
  }

  function handleDeletePost(id, type) {
    // update userFanposts:
    const newArray =
      type === "fanposts" ? [...displayingFanposts] : [...displayingTradeIdeas]
    const updatedArray = newArray.filter(
      (idea) => JSON.stringify(idea._id) !== JSON.stringify(id)
    )

    if (type === "fanposts") setdisplayingFanposts(updatedArray)
    else setdisplayingTradeIdeas(updatedArray)

    // adjust the displaying indexes if needed:
    if (newArray.length - 1 == displayingIndexes.split("-")[0])
      setdisplayingIndexes(
        +displayingIndexes.split("-")[0] -
          4 +
          "-" +
          (+displayingIndexes.split("-")[1] - 4)
      )

    // start the animation
    const loader = document.querySelector(".profile-page-loader")
    loader.style.display = "block"

    // update in the db:
    axios
      .delete(dbApiUrl + "/" + type + "/" + id)
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
        console.error("Failed deleting.", err.message)

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

  function handleChangeIndexes(type) {
    const indexesSplit = displayingIndexes.split("-")

    switch (type) {
      case "back":
        setdisplayingIndexes(
          +indexesSplit[0] - 4 + "-" + (+indexesSplit[1] - 4)
        )
        break
      case "forward":
        setdisplayingIndexes(
          +indexesSplit[0] + 4 + "-" + (+indexesSplit[1] + 4)
        )
        break
    }
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <p className="page-description">Your account settings and posts.</p>
      <div className="loader4 profile-page-loader"></div>
      <div className="page-text-container">
        <h1>Profile Settings</h1>
        <p>Here you can change your account settings.</p>
        <br />
        <p>
          Change your old user name or password by clicking them and typing the
          change you want to make. Click enter to apply.
        </p>
        <br />
        <p>
          Any change made to your user name or password will be applied
          immediately.
        </p>
        <br />
        <p className="end">Enjoy your time, Bucks fan!</p>
      </div>
      <div className="second-wrapper">
        <div className="profile-container">
          <p ref={updatedMsgRef} className="updated-account-msg">
            Account updated successfully!
          </p>
          <div className="profile">
            <div className="email">
              <div>
                Email:
                <form onSubmit={(e) => e.preventDefault()}>
                  <input value={email} readOnly />
                </form>
              </div>
            </div>
            <div className="user-name">
              <div>
                User Name:
                <form onSubmit={(e) => e.preventDefault()}>
                  <input value={userName} readOnly />
                </form>
              </div>
            </div>
            <div className="password">
              <div>
                Password:
                <form onSubmit={(e) => handleSubmit(e)}>
                  <input
                    ref={newPasswordRef}
                    value={newPassword}
                    type={showPass ? "text" : "password"}
                    onChange={(e) => setnewPassword(e.target.value)}
                  />
                </form>
              </div>
              <button className="toggle-pw" onClick={handleClick}>
                {showPass ? <BiSolidHide /> : <BiSolidShow />}
              </button>
            </div>
            {!isValidNewPw && getPwError()}
          </div>
        </div>
        <ProfilePic setImageUrl={setprofilePicUrl} imageUrl={profilePicUrl} />
        <div className="user-posts">
          <div className="displaying-thing-menu">
            <button
              className={displayingPosts === "fanposts" ? "active" : ""}
              onClick={() => setdisplayingPosts("fanposts")}
            >
              Fanposts
            </button>
            <button
              className={displayingPosts === "trade ideas" ? "active" : ""}
              onClick={() => setdisplayingPosts("trade ideas")}
            >
              Trade Ideas
            </button>
          </div>
          {
            <div className="all-fanposts-container user-fanposts post-container">
              <div className="title-container">
                <div className="name-container">
                  <h2 className="title-name">
                    {displayingPosts === "fanposts"
                      ? "Your Posts"
                      : "Your Ideas"}
                  </h2>
                </div>
                <div className="search-container">
                  <input
                    value={query}
                    placeholder="Search Fanposts"
                    onChange={(e) => handleQueryChange(e, "fanposts")}
                    maxLength={30}
                  />
                  <button>
                    <IoSearchSharp />
                  </button>
                </div>
              </div>
              <div className="titles">
                <h2 className="subject-title">Subject</h2>
                <h2 className="comments-title">Comments Rec</h2>
              </div>
              {displayingPosts === "fanposts" ? (
                displayingFanposts ? (
                  <div className="fanposts-container">
                    {displayingFanposts.length ? (
                      displayingFanposts.map((post, index) => (
                        <div
                          key={uuidv4()}
                          className={
                            "fanpost-link-container " +
                            (index % 2 === 0 ? "even" : "")
                          }
                          style={
                            index < displayingIndexes.split("-")[0] ||
                            index > displayingIndexes.split("-")[1]
                              ? { display: "none" }
                              : {}
                          }
                        >
                          <div className="left-container">
                            <a
                              className="link"
                              onClick={() =>
                                handleGoToFanpost(
                                  post,
                                  allFanposts.findIndex(
                                    (fanpost) => fanpost._id === post._id
                                  ) + 1,
                                  allFanposts,
                                  navigate
                                )
                              }
                            >
                              {post.title}
                            </a>
                            <em>
                              {timeAgo(
                                post.date.year,
                                post.date.month,
                                post.date.day,
                                post.date.hour,
                                post.date.minute
                              )}
                            </em>
                          </div>
                          <div className="right-container">
                            <p className="comments-num">
                              {post.comments.length} comments
                            </p>
                            <button
                              className="remove-fanpost-btn"
                              onClick={() =>
                                handleDeletePost(post._id, "fanposts")
                              }
                            >
                              DEL
                            </button>
                          </div>
                        </div>
                      ))
                    ) : userFanposts.length ? (
                      <p className="no-fanposts-msg">
                        No posts match this search
                      </p>
                    ) : (
                      <Link to="/PostFanpost" className="first-post-msg">
                        Click to post your first fanpost!
                      </Link>
                    )}
                    {displayingFanposts.length > 4 ? (
                      <div className="navigate-container">
                        {displayingIndexes.split("-")[0] > 0 && (
                          <div
                            className="backward"
                            onClick={() => handleChangeIndexes("back")}
                          >
                            <p>Backward</p>
                            <IoArrowBack className="icon" />
                          </div>
                        )}
                        {displayingIndexes.split("-")[1] <
                          displayingFanposts.length - 1 && (
                          <div
                            className="forward"
                            onClick={() => handleChangeIndexes("forward")}
                          >
                            <IoArrowForwardSharp className="icon" />
                            <p>Forward</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  <div>
                    {["loading", "success"].includes(fanpostsStatus) ? (
                      <div className="loader6"></div>
                    ) : (
                      <p className="error-msg">
                        It looks like we have a problem... try again later
                      </p>
                    )}
                  </div>
                )
              ) : displayingTradeIdeas ? (
                <div className="fanposts-container">
                  {displayingTradeIdeas.length ? (
                    displayingTradeIdeas.map((idea, index) => (
                      <div
                        key={uuidv4()}
                        className={
                          "fanpost-link-container " +
                          (index % 2 === 0 ? "even" : "")
                        }
                        style={
                          index < displayingIndexes.split("-")[0] ||
                          index > displayingIndexes.split("-")[1]
                            ? { display: "none" }
                            : {}
                        }
                      >
                        <div className="left-container">
                          <a className="link">{idea.description}</a>
                          <em>
                            {timeAgo(
                              idea.date.year,
                              idea.date.month,
                              idea.date.day,
                              idea.date.hour,
                              idea.date.minute
                            )}
                          </em>
                        </div>
                        <div className="right-container">
                          <p className="comments-num">
                            {idea.comments.length} comments
                          </p>
                          <button
                            className="remove-fanpost-btn"
                            onClick={() =>
                              handleDeletePost(idea._id, "tradeIdeas")
                            }
                          >
                            DEL
                          </button>
                        </div>
                      </div>
                    ))
                  ) : userTradeIdeas.length ? (
                    <p className="no-fanposts-msg">
                      No posts match this search
                    </p>
                  ) : (
                    <Link to="/PostFanpost">
                      Click to post your first fanpost!
                    </Link>
                  )}
                  {displayingTradeIdeas.length > 4 ? (
                    <div className="navigate-container">
                      {displayingIndexes.split("-")[0] > 0 && (
                        <div
                          className="backward"
                          onClick={() => handleChangeIndexes("back")}
                        >
                          <p>Backward</p>
                          <IoArrowBack className="icon" />
                        </div>
                      )}
                      {displayingIndexes.split("-")[1] <
                        displayingTradeIdeas.length - 1 && (
                        <div
                          className="forward"
                          onClick={() => handleChangeIndexes("forward")}
                        >
                          <IoArrowForwardSharp className="icon" />
                          <p>Forward</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div>
                  {["loading", "success"].includes(tradeIdeasStatus) ? (
                    <div className="loader6"></div>
                  ) : (
                    <p className="error-msg">
                      It looks like we have a problem... try again later
                    </p>
                  )}
                </div>
              )}
            </div>
          }
        </div>
      </div>
      <div className="page-expandor">hi</div>
    </div>
  )
}

export default Profile
