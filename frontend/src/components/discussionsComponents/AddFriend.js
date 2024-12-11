import React, { useState, useEffect, useContext } from "react"

import { useNavigate } from "react-router-dom"

import { Context } from "../../App"

import axios from "axios"

const dbApiUrl = process.env.REACT_APP_API_URL

function AddFriend({ name, className, addition }) {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const setactiveChat = useContext(Context)[5]
  const setactiveChatIndex = useContext(Context)[7]

  const userData = useContext(Context)[8]
  const setuserData = useContext(Context)[9]

  const queryClient = useContext(Context)[10]

  const [isVisible, setisVisible] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    async function handleClick(e) {
      // avoid error
      if (!e.target.outerText) {
        setisVisible(false)
        return
      }

      const outerText = addition
        ? e.target.outerText.replace(addition, "")
        : e.target.outerText

      if (
        e.target.classList.contains("user-add-friend") &&
        outerText === name
      ) {
        if (!isSignedIn) {
          alert(`Sign in to interact with ${name}!`)
          return
        }

        setisVisible((prev) => !prev)

        // logic to prefetch the oneRoster data, because there is a high chance for it to be clicked
        if (!isVisible) {
          // not isVisible because its technically not changed yet

          // make sure there is no data or loading data inside "oneRoster" cache key
          queryClient.cancelQueries("oneRoster")
          queryClient.removeQueries("oneRoster")

          // fetch the oneRoster data fetching method
          const fetchOneRoster = (
            await import("../../functions/fetchOneRoster")
          ).default

          await queryClient.prefetchQuery("oneRoster", () =>
            fetchOneRoster(name)
          )
        }
      } else setisVisible(false)
    }

    // if !isSigned in the event listener exist to alert a message
    if (username !== name && (userData || !isSignedIn))
      document.addEventListener("click", handleClick)

    return () => document.removeEventListener("click", handleClick)
  }, [])

  function handleSendFriendRequest() {
    if (userData.friend_requests.includes(name)) {
      // accept the friend request
      axios
        .post(dbApiUrl + "/users/acceptFriend", {
          accepter: username,
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

          alert(name + " is now your friend!")
        })
        .catch((err) => {
          alert("Problem accepting friend request.")
          console.error("Couldn't accept friend request.", err.message)
        })
    } else {
      // send a friend request
      axios
        .post(dbApiUrl + "/users/sendFriendRequest", {
          getter: name,
          sender: username,
        })
        .then(() => {
          alert("Friend request sent successfully.")
        })
        .catch((err) => {
          alert(err.response.data.message)
          console.error("Couldn't send a friend request.", err.message)
        })
    }
  }

  function handleStartDM() {
    // only post the chat after the first msg

    const chatStartTemplate = {
      chatters: [username, name],
      messages: [],
      came_from_add_friend: true, // temp variable
    }

    setactiveChat(chatStartTemplate)
    // indicate its a new chat and make sure it changes
    setactiveChatIndex((prev) => (prev === null ? undefined : null))

    // scroll to the top of the screen
    window.scrollTo({ top: 0, behavior: "smooth" })

    // avoid bug that there is empty space on the right of the document
    setTimeout(() => window.scrollTo({ left: 0, behavior: "smooth" }))

    const dmSlide = document.querySelector(".DM-slide")
    dmSlide.classList.add("active")
    dmSlide.classList.add("double-active")
  }

  function handleViewRoster() {
    // start the freezing screen loading indicator:
    const overlay = document.querySelector(".overlay")
    overlay.style.display = "block"

    // check if the user's roster is visible:
    axios
      .get(dbApiUrl + "/users/user/" + name)
      .then((res) => {
        overlay.style.display = "none" // end the animation

        if (res.data.roster.visible)
          navigate("/OneRoster/" + res.data.userName, {
            state: res.data.roster,
          })
        else
          alert(
            name +
              "'s roster is currently private. You can always chat with them to know about it!"
          )
      })
      .catch((err) => {
        overlay.style.display = "none" // end the animation

        alert("It looks like we have a problem... Please try again later.")

        console.error("A problem occured.", err.message)
      })
  }

  return (
    <span
      className={"username-display-container " + (className ? className : "")}
      style={isVisible ? { zIndex: 2 } : {}}
    >
      <span
        className="user-option-container"
        style={
          isVisible ? { opacity: "1" } : { opacity: "0", cursor: "default" }
        }
      >
        <button
          onClick={isVisible ? handleViewRoster : () => ""}
          style={!isVisible ? { cursor: "default" } : {}}
        >
          View <br /> Roster
        </button>
        {userData && !userData.friends.includes(name) && (
          <>
            <hr />
            <button
              className="friend-btn"
              style={!isVisible ? { cursor: "default" } : {}}
              onClick={isVisible ? handleSendFriendRequest : () => ""}
            >
              {userData.friend_requests.includes(name) ? (
                <>
                  Accept <br /> Friend
                </>
              ) : (
                <>
                  Add <br /> Friend
                </>
              )}
            </button>
            <hr />
          </>
        )}
        <button
          style={!isVisible ? { cursor: "default" } : {}}
          onClick={isVisible ? handleStartDM : () => ""}
        >
          DM
        </button>
      </span>
      <em
        className={"user-add-friend " + (className ? className : "")}
        style={
          name === username ? { cursor: "auto", textDecoration: "none " } : {}
        }
      >
        {name}
        {addition && addition}
      </em>
    </span>
  )
}

export default AddFriend
