import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useTransition,
} from "react"
import "./Navigation.css"

import { useNavigate, useLocation } from "react-router-dom"

import { IoMdClose } from "react-icons/io"
import { TbMessage2, TbMessage2Exclamation } from "react-icons/tb"
import { AiOutlineCheck } from "react-icons/ai"
import { FaInstagram } from "react-icons/fa6"
import { FaTwitter } from "react-icons/fa6"
import { SiTiktok } from "react-icons/si"
import { ImYoutube } from "react-icons/im"
import { FaSnapchatGhost } from "react-icons/fa"
import { FaFacebookF } from "react-icons/fa"
import { IoMdArrowDropright } from "react-icons/io"
import { IoMdArrowDropdown } from "react-icons/io"
import { RxDotFilled } from "react-icons/rx"

import DMs from "../components/discussionsComponents/DMs"

import bucks_logo from "../images/bucks/bucks_logo.png"
import coinIcon from "../images/coin_icon.png"

import { Context } from "../App"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"
import sleep from "../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function Navigation({ setpassword, setemail }) {
  const [isSignedIn, setisSignedIn, userName, setuserName] = useContext(Context)
  const userData = useContext(Context)[8]
  const setuserData = useContext(Context)[9]

  const setactiveChatIndex = useContext(Context)[7]

  const [currentUserChats, setcurrentUserChats] = useState(null)

  const [isPending, startTransition] = useTransition()

  const [showingFriendRequests, setshowingFriendRequests] = useState(false)

  const [dmQuery, setdmQuery] = useState("")

  const isHomePage = useLocation().pathname === "/"

  // put the manage account setting below the manage account icon:

  const manageAccountIconRef = useRef()
  const manageAccountSettingRef = useRef()
  const bucksConRef = useRef()
  const socialMediaConRef = useRef()
  const moreIconRef = useRef()

  const postsRef = useRef()

  useEffect(() => {
    function handleResize() {
      // ensure the new positions are up to date
      setTimeout(() => {
        // acount settings
        const manageAccountSetting = document.querySelector(
          ".settings-container"
        )
        const rightSettings =
          manageAccountIconRef.current.getBoundingClientRect().right
        manageAccountSetting.style.left = rightSettings + "px"

        // posts
        const postsCon = document.querySelector(".posts-container")
        const rightPosts = postsRef.current.getBoundingClientRect().right
        postsCon.style.left = rightPosts + "px"

        // more
        const moreCon = document.querySelector(".more-container")
        const rightMore = moreIconRef.current.getBoundingClientRect().right
        moreCon.style.left = rightMore + "px"
      }, 100)
    }

    handleResize() // call init

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [userData]) // fetching user data will change the position of the trees because of the coins display

  //

  const [popupVisible, setPopupVisible] = useState(false)

  const navigate = useNavigate()

  function handleClick(action) {
    switch (action) {
      case "show":
        setPopupVisible(true)
        break
      case "confirm":
        setPopupVisible(false)
        setuserName("Guest")
        setpassword("")
        setemail("")
        setisSignedIn(false)
        setuserData(null)
        navigate("/")

        setTimeout(() => alert("Logged out.")) // show a message after navigating to home page
        break
      case "cancel":
        setPopupVisible(false)
        break
    }
  }

  function handleToggleSocial(e, type, name) {
    const icon = document.querySelector("." + name)
    let theRef

    switch (name) {
      case "posts-container":
        theRef = postsRef.current
        break
      case "settings-container":
        theRef = manageAccountSettingRef.current
        break
      case "more-container":
        theRef = moreIconRef.current
        break
    }

    // check if the mouse is going below the icon:
    const iconRect = theRef.getBoundingClientRect()
    const settingsRect = icon.getBoundingClientRect()

    switch (type) {
      case "leave":
        if (e.clientY > iconRect.bottom) return
        break
      case "leaveSettings":
        if (
          e.clientY <= iconRect.bottom &&
          e.clientX >= iconRect.left &&
          e.clientX <= iconRect.right
        )
          return
        break
      case "enter":
        if (
          !icon.classList.value.includes("invisible") &&
          e.clientY <= iconRect.bottom &&
          e.clientX >= settingsRect.left &&
          e.clientX <= settingsRect.right
        )
          return
        break
    }

    icon.classList.toggle("invisible")
  }

  function handleToggleSocialLeft(e, type, name) {
    const icon = document.querySelector("." + name)
    let theRef

    switch (name) {
      case "social-container":
        theRef = socialMediaConRef.current
        break
      case "bucks-container":
        theRef = bucksConRef.current
        break
    }

    // check if the mouse is going below the icon:
    const iconRect = theRef.getBoundingClientRect()
    const settingsRect = icon.getBoundingClientRect()

    switch (type) {
      case "leave":
        if (
          e.clientX > settingsRect.left - 5 &&
          e.clientY > iconRect.top &&
          e.clientY < iconRect.bottom
        )
          return
        break
      case "leaveSettings":
        if (
          e.clientX <= iconRect.right &&
          e.clientY < iconRect.top &&
          e.clientY > iconRect.bottom
        )
          return
        break
      case "enter":
        if (
          !icon.classList.value.includes("invisible") &&
          e.clientY <= iconRect.bottom &&
          e.clientX >= settingsRect.left &&
          e.clientX <= settingsRect.right
        )
          return
        break
    }

    icon.classList.toggle("invisible")
  }

  function handleNavigate(path) {
    startTransition(() => navigate(path))
    document.querySelector(".DM-slide").classList.remove("active")
  }

  function handleShowNotifications() {
    setactiveChatIndex(null) // make sure no chat is selected

    // show the dm-slide

    const dmSlide = document.querySelector(".DM-slide")

    dmSlide.classList.toggle("active")
    if (!dmSlide.classList.contains("active"))
      setTimeout(() => setdmQuery(""), 700)

    dmSlide.classList.remove("double-active")
  }

  function handleShowFriendRequests() {
    if (userData.friend_requests.length) setshowingFriendRequests(true)
    else alert("You don't have any friend requests.")
  }

  function handleFriendRequest(type, name) {
    const loader = document.querySelector(".navigation-loader")
    loader.style.display = "block"

    if (type === "accept") {
      axios
        .post(dbApiUrl + "/users/acceptFriend", {
          accepter: userName,
          requester: name,
        })
        .then(async () => {
          // update userData

          const newFriendRequests = userData.friend_requests.filter(
            (item) => item != name
          )
          const newFriends = userData.friends
          newFriends.push(name)

          setuserData((prev) => {
            return {
              ...prev,
              friend_requests: newFriendRequests,
              friends: newFriends,
            }
          })

          // if it was the last request
          if (!newFriendRequests.length) setshowingFriendRequests(false)

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
          console.error("Couldn't accept friend request.", err.message)

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
      axios
        .post(dbApiUrl + "/users/denyFriend", {
          denyer: userName,
          requester: name,
        })
        .then(async () => {
          // update userData

          const newFriendRequests = userData.friend_requests.filter(
            (item) => item != name
          )

          setuserData((prev) => {
            return { ...prev, friend_requests: newFriendRequests }
          })

          // if its the last request
          if (!newFriendRequests.length) setshowingFriendRequests(false)

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
          console.error("Couldn't decline friend request.", err.message)

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

  // close the friend requests container on any click outside of it:
  useEffect(() => {
    function closeContainer(e) {
      if (
        !(
          e.target.closest(".friend-requests-container") ||
          e.target.closest(".friend-requests-btn")
        )
      )
        setshowingFriendRequests((prev) => prev && false)
    }

    document.addEventListener("click", closeContainer)

    return () => {
      document.removeEventListener("click", closeContainer)
    }
  }, [])

  return (
    <>
      <div className="loader4 navigation-loader"></div>
      <div className="nav-bar">
        <div className={`log-out-clarification ${popupVisible && "visible"}`}>
          <button onClick={() => handleClick("confirm")} className="confirm">
            Confirm
          </button>
          <p>Log out of '{userName}'?</p>
          <button onClick={() => handleClick("cancel")} className="cancel">
            <IoMdClose />
          </button>
        </div>
        <div className="left-nav">
          <button
            className="username-btn navBtn"
            onClick={() => handleNavigate("/")}
          >
            Hello {userName}!
          </button>
          <div className="in-container">
            <div>
              <div
                className="tree posts"
                style={{ marginRight: "5px" }}
                ref={postsRef}
                onMouseEnter={(e) =>
                  handleToggleSocial(e, "enter", "posts-container")
                }
                onMouseLeave={(e) =>
                  handleToggleSocial(e, "leave", "posts-container")
                }
              >
                Posts
                <IoMdArrowDropdown />
              </div>
              <button
                className="navBtn"
                style={{ margin: "0 5px" }}
                onClick={() => handleNavigate("/Leaderboard/0-5")}
              >
                Leaderboard
              </button>
              <button
                className="navBtn"
                style={{ marginLeft: "5px" }}
                onClick={() => handleNavigate("/UserRoster")}
              >
                MyRoster
              </button>
            </div>
          </div>
          {isSignedIn && userData && (
            <button className="navBtn coins-num">
              Coins: {userData.coins}{" "}
              <img className="coin-icon" alt="coins" src={coinIcon} />
            </button>
          )}
        </div>
        <div className="right-nav">
          <div
            className="tree more"
            ref={moreIconRef}
            onMouseEnter={(e) =>
              handleToggleSocial(e, "enter", "more-container")
            }
            onMouseLeave={(e) =>
              handleToggleSocial(e, "leave", "more-container")
            }
          >
            More
            <IoMdArrowDropdown />
          </div>
          <button className="logo" onClick={() => handleNavigate("/")}>
            <img src={bucks_logo} alt="Bucks logo" />
          </button>
          <div className="icon-container">
            <div
              className="tree settings"
              ref={manageAccountIconRef}
              onMouseEnter={(e) =>
                handleToggleSocial(e, "enter", "settings-container")
              }
              onMouseLeave={(e) =>
                handleToggleSocial(e, "leave", "settings-container")
              }
            >
              {isSignedIn ? "Settings" : "Sign in/up"}
              <IoMdArrowDropdown />
              {userData && userData.friend_requests.length > 0 && (
                <RxDotFilled className="notification" />
              )}
            </div>
            <div className="nav-icon DMs" onClick={handleShowNotifications}>
              {currentUserChats &&
              isSignedIn &&
              currentUserChats.some(
                (chat) =>
                  chat.messages.length &&
                  !chat.messages.at(-1).read &&
                  chat.messages.at(-1).sender !== userName
              ) ? (
                <TbMessage2Exclamation className="unread-msgs" />
              ) : (
                <TbMessage2 />
              )}
            </div>
          </div>
        </div>
        <div
          ref={manageAccountSettingRef}
          className="pop-up-container invisible settings-container"
          style={!isSignedIn ? { translate: "-100%" } : {}}
          onMouseLeave={(e) =>
            handleToggleSocial(e, "leaveSettings", "settings-container")
          }
        >
          {userName === "Guest" ? (
            <>
              <button onClick={() => handleNavigate("/SignIn")}>Sign in</button>
              <button onClick={() => handleNavigate("/SignUp")}>Sign up</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/Profile/" + userName)}>
                Profile
              </button>
              <button
                className="friend-requests-btn"
                onClick={handleShowFriendRequests}
              >
                Friend <br /> Requests{" "}
                {userData && `(${userData.friend_requests.length})`}
              </button>
              <button
                style={{ borderBottom: "none" }}
                onClick={() => handleClick("show")}
              >
                Log out
              </button>
            </>
          )}
        </div>
        <div
          className="posts-container invisible pop-up-container"
          onMouseLeave={(e) =>
            handleToggleSocial(e, "leaveSettings", "posts-container")
          }
        >
          <button
            className="navBtn"
            onClick={() => handleNavigate("/Fanposts")}
          >
            Fanposts
          </button>
          <button
            className="navBtn"
            onClick={() => handleNavigate("/AvailableTickets")}
          >
            Tickets
          </button>
          <button
            className="navBtn"
            onClick={() => handleNavigate("/TradeIdeas")}
          >
            Trade Ideas
          </button>
        </div>
        <div
          className="pop-up-container invisible more-container"
          onMouseLeave={(e) =>
            handleToggleSocial(e, "leaveSettings", "more-container")
          }
        >
          <button className="navBtn" onClick={() => handleNavigate("/Guide")}>
            Guide Page
          </button>
          <button className="navBtn" onClick={() => handleNavigate("/About")}>
            About Me
          </button>
        </div>
      </div>
      {isPending && <div className="loader5"></div>}
      <DMs
        currentUserChats={currentUserChats}
        setcurrentUserChats={setcurrentUserChats}
        query={dmQuery}
        setquery={setdmQuery}
      />
      {showingFriendRequests && (
        <div className="friend-requests-container">
          {userData ? (
            userData ? (
              userData.friend_requests.map((name) => (
                <div key={uuidv4()} className="name-container">
                  <div className="left-container">
                    <h3 className="name">{name}</h3>
                    <div className="seperator"></div>
                  </div>
                  <div className="buttons-container">
                    <button
                      className="accpet-btn"
                      onClick={() => handleFriendRequest("accept", name)}
                    >
                      <AiOutlineCheck />
                    </button>
                    <button
                      className="deny-btn"
                      onClick={() => handleFriendRequest("deny", name)}
                    >
                      <IoMdClose />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="loader6"></div>
            )
          ) : (
            ""
          )}
        </div>
      )}
      {isHomePage && (
        <div className="left-pop-ups">
          <div>
            <div
              className="tree bucks"
              ref={bucksConRef}
              onMouseEnter={(e) =>
                handleToggleSocialLeft(e, "enter", "bucks-container")
              }
              onMouseLeave={(e) =>
                handleToggleSocialLeft(e, "leave", "bucks-container")
              }
            >
              Bucks
              <IoMdArrowDropright />
            </div>
            <div
              className="bucks-container pop-up-container invisible"
              onMouseLeave={(e) =>
                handleToggleSocialLeft(e, "leaveSettings", "bucks-container")
              }
            >
              <button
                className="navBtn"
                onClick={() => handleNavigate("/Roster")}
              >
                Roster
              </button>
              <button
                className="navBtn"
                onClick={() => handleNavigate("/Schedule")}
              >
                Schedule
              </button>
            </div>
          </div>
          <div>
            <div
              className="tree media"
              ref={socialMediaConRef}
              onMouseEnter={(e) =>
                handleToggleSocialLeft(e, "enter", "social-container")
              }
              onMouseLeave={(e) =>
                handleToggleSocialLeft(e, "leave", "social-container")
              }
            >
              Media
              <IoMdArrowDropright />
            </div>
            <div
              className="pop-up-container social-container invisible"
              onMouseLeave={(e) =>
                handleToggleSocialLeft(e, "leaveSettings", "social-container")
              }
            >
              <div>
                <a
                  href="https://www.facebook.com/milwaukeebucks"
                  className="social-icon"
                  target="_blank"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.snapchat.com/add/bucksdotcom"
                  className="social-icon"
                  target="_blank"
                >
                  <FaSnapchatGhost />
                </a>
                <a
                  className="social-icon"
                  href="https://www.youtube.com/bucks"
                  target="_blank"
                >
                  <ImYoutube />
                </a>
              </div>
              <div>
                <a
                  className="social-icon"
                  href="https://www.tiktok.com/@bucks"
                  target="_blank"
                >
                  <SiTiktok />
                </a>
                <a
                  className="social-icon"
                  href="https://www.instagram.com/bucks/"
                  target="_blank"
                >
                  <FaInstagram />
                </a>
                <a
                  className="social-icon"
                  href="https://twitter.com/Bucks"
                  target="_blank"
                >
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation
