import React, { useContext, useState, useEffect, useRef } from "react"

import "../../navigation/Navigation.css"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import { SlOptionsVertical } from "react-icons/sl"
import { IoMdClose } from "react-icons/io"
import { AiFillDelete } from "react-icons/ai"
import { MdModeEdit } from "react-icons/md"
import { FaReply } from "react-icons/fa6"
import { LuClock12 } from "react-icons/lu"
import { IoMdCheckmark } from "react-icons/io"
import { IoMdDoneAll } from "react-icons/io"

import defaultPFP from "../../images/default_user.png"
import pfp_loader from "../../images/bucks/pfp_loader.jpg"

import timeAgo from "../../functions/timeAgo"

import { useQuery } from "react-query"

import { Context } from "../../App"
import ChatInput from "../homeComponents/ChatInput"

import { io } from "socket.io-client"

const dbApiUrl = process.env.REACT_APP_API_URL

const SOCKET_SERVER_URL = dbApiUrl
const socket = io(SOCKET_SERVER_URL)

function DMs({ currentUserChats, setcurrentUserChats, query, setquery }) {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const activeChat = useContext(Context)[4]
  const setactiveChat = useContext(Context)[5]
  const activeChatIndex = useContext(Context)[6]
  const setactiveChatIndex = useContext(Context)[7]

  const userData = useContext(Context)[8]

  const [selectedUserChats, setselectedUserChats] = useState(null)
  const [friendsTemplates, setfriendsTemplates] = useState(null)

  const { status } = useQuery({
    queryKey: ["userChats"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // guests dont have messages
      if (!isSignedIn) return Promise.reject(new Error("User is not signed in"))

      return axios.get(dbApiUrl + "/chats/" + username).then((res) => res.data)
    },
    onSuccess: (data) => {
      // get the profile pic here
      const sortedData = sortedByLastMsg(
        data.map(({ other_profile_pic, ...rest }) => rest)
      )

      // set init without fetching the pfps
      setselectedUserChats(sortedData)
      setcurrentUserChats(sortedData)

      // fetch pfps one at a time
      sortedData.forEach(async (chat, index) => {
        const fetchingName = chat.chatters.find(
          (chatter) => chatter !== username
        )

        const userFriend = await axios
          .get(dbApiUrl + "/users/user/" + fetchingName)
          .then((res) => res.data)
          .catch((err) => {
            console.error("Couldn't fetch friend's data.", err.message)
          })

        // Update profile picture if fetched successfully
        if (userFriend && userFriend.profile_pic_url) {
          setselectedUserChats((prev) => {
            const newArray = [...prev]
            newArray[index].other_profile_pic = userFriend.profile_pic_url
            return newArray
          })
        }
      })
    },
    onError: (err) =>
      console.error("couldn't fetch user's chats.", err.message),
  })

  function sortedByLastMsg(array) {
    const newArray = array.sort((a, b) => {
      // order if there is a new chat
      if (!a.messages.length && !b.messages.length) return 0
      if (!a.messages.length) return 1
      if (!b.messages.length) return -1

      // order by last message date
      return b.messages.at(-1).date.time - a.messages.at(-1).date.time
    })

    return newArray
  }

  function putFirstInArray(array, item) {
    const index = array.findIndex((obj) => obj._id === item._id)

    array.splice(index, 1) // remove the item from its current postion
    array.unshift(item) // add to the beggining of the array

    return array
  }

  // socket.io (make it real-time chats):

  useEffect(() => {
    if (!isSignedIn) return // guests cant get messages

    // tell the server this user is connected
    socket.emit("login", username)

    // listen for messages from the server to the user
    socket.on("message", (newObj) => {
      // must update states via prev, because here the state value would be the initial value

      // get the sender
      const sender = newObj.is_new_chat
        ? newObj.chatters.find((chatter) => chatter !== username)
        : newObj.sender

      if (newObj.is_new_chat) {
        // update currentUserChats with the new chat

        delete newObj.is_new_chat // delete temp variable
        setcurrentUserChats((prev) => [...prev, newObj])
      } else {
        setcurrentUserChats((prev) => {
          const newUserChats = [...prev]

          // find the existing chat index
          const chatIndex = newUserChats.findIndex((chat) =>
            chat.chatters.includes(sender)
          )
          const newChat = newUserChats[chatIndex]
          newChat.messages.push(newObj) // push the new message
          newUserChats[chatIndex] = newChat // update to the new chat
          return newUserChats
        })
      }

      // if the new chat should be immediately visible as the first chat
      if (
        activeChatType === "recent" ||
        (userData && userData.friends.includes(sender))
      ) {
        setselectedUserChats((prev) => {
          const newSelectedChats = [...prev]
          let newChat

          // find the selectedUserChats chat index (if it exists)
          const chatIndex = newSelectedChats.findIndex((chat) =>
            chat.chatters.includes(sender)
          )

          // if the chat exists, save it and remove it from the array
          if (chatIndex !== -1) {
            newChat = newSelectedChats[chatIndex] // save the new chat

            newSelectedChats.splice(chatIndex, 1) // remove the saved chat from the array

            setactiveChat((prev) => {
              // check if the user is on this chat
              if (prev && newChat._id === prev._id) {
                setactiveChatIndex(0)

                newChat.messages.at(-1).read = true // mark the last message as read

                // automatically scroll down:
                setTimeout(() => {
                  const msgsContainer = document.querySelector(".msgs")
                  msgsContainer.scrollTop = msgsContainer.scrollHeight
                })
                // tell the server the new message is read
                socket.emit("read", { recipient: sender, personRead: username })

                return newChat // update activeChat
              }
              // else make sure the user is on the correct chat index
              setactiveChatIndex((prev) => {
                if (prev && chatIndex > prev) return prev + 1
              })

              return prev // keep it the same
            })

            newSelectedChats.unshift(newChat)
            return newSelectedChats
          }

          newChat = newObj // else the chat is the recieved data

          // update selectedUserChats
          newSelectedChats.unshift(newChat)
          setactiveChatIndex((prev) => prev + 1) // update activeChatIndex

          return newSelectedChats
        })
      }
    })

    socket.on("read", (personRead) => {
      // must update states via prev, because here the state value would be the initial value

      // update activeChat, selectedUserChats and currentUserChats as all messages read
      setcurrentUserChats((prev) => {
        const newCurrentUsers = [...prev]

        const newMsgs = newCurrentUsers
          .find((chat) => chat.chatters.includes(personRead))
          .messages.map((obj) => {
            return { ...obj, read: true }
          })

        // start with activeChat
        setactiveChat((prevActiveChat) => {
          const newChat = {
            ...prevActiveChat,
            chatters: [username, personRead], // for when the prev might start at null
          }
          newChat.messages = newMsgs
          return newChat
        })

        // now selectedUserChats

        setselectedUserChats((selectedUserChatsPrev) => {
          const newSelectedChats = [...selectedUserChatsPrev]

          const chatIndex = newSelectedChats.findIndex((chat) =>
            chat.chatters.includes(personRead)
          )
          newSelectedChats[chatIndex].messages = newMsgs
          return newSelectedChats // update
        })

        // now currentUserChats

        const indexInCurrentChats = newCurrentUsers.findIndex((chat) =>
          chat.chatters.includes(personRead)
        )
        newCurrentUsers[indexInCurrentChats].messages = newMsgs

        // patch it in the db
        axios
          .patch(
            dbApiUrl + "/chats/" + newCurrentUsers[indexInCurrentChats]._id,
            {
              messages: newMsgs,
            }
          )
          .catch((err) => {
            console.error("Couldn't patch chats.", err.message)
          })

        return newCurrentUsers // update currentUserChats
      })
    })
  }, [])

  useEffect(() => {
    function handleBeforeUnload() {
      socket.disconnect() // disconnect socket
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  //

  const [typingMsg, settypingMsg] = useState("")

  const [editingIndex, seteditingIndex] = useState("")
  const [editingValue, seteditingValue] = useState("")

  const [activeChatType, setactiveChatType] = useState("recent")

  const [replyingId, setreplyingId] = useState(null)

  const [openMsgOptions, setopenMsgOptions] = useState(null)

  const editingInputRef = useRef(null)

  // scroll a chat all the way down init:
  useEffect(() => {
    const msgsContainer = document.querySelector(".msgs")
    if (msgsContainer) {
      msgsContainer.style.scrollBehavior = "auto" // make it immediate

      msgsContainer.scrollTop =
        msgsContainer.scrollHeight - msgsContainer.offsetHeight

      msgsContainer.style.scrollBehavior = "smooth" // back to how it was
    }
  }, [activeChatIndex])

  function handleChatClick(index) {
    setactiveChatIndex(index)
    setactiveChat(selectedUserChats[index])

    // focus the input init on chat swich
    const inputBar = document.querySelector(".add-DM-input")
    inputBar && inputBar.focus()

    // extend DM-slide even more
    document.querySelector(".DM-slide").classList.add("double-active")

    if (
      !selectedUserChats[index].messages.length ||
      selectedUserChats[index].messages.at(-1).read ||
      selectedUserChats[index].messages.at(-1).sender === username
    )
      return

    const newArray = [...selectedUserChats]

    const newMsgs = selectedUserChats[index].messages.map((obj) => {
      return { ...obj, read: true }
    })

    newArray[index].messages = newMsgs

    setactiveChat(newArray[index])
    setselectedUserChats(newArray)

    // tell the server the new message/s is/are read
    const recipient = newArray[index].chatters.find(
      (chatter) => chatter !== username
    )
    socket.emit("read", { recipient: recipient, personRead: username })

    putUserChats(newArray, index)
  }

  function handleSetReplyingId(id) {
    setreplyingId(id)
    document.querySelector(".input-container.dm").style.bottom = "3%" // slide back to normal

    setopenMsgOptions(null) // close msg options too
  }

  function handleToggleMsgOptions(index, toDelete) {
    setopenMsgOptions(activeChatIndex + "-" + index)

    if (toDelete) setopenMsgOptions(null)
  }

  function handleMsgOptionClick(action, msgObj) {
    const newMsgObj = { ...msgObj }

    switch (action) {
      case "delete":
        // check if a user is allowed to delete (15 minutes window)
        const currentTime = new Date().getTime()
        if (currentTime - msgObj.date.time > 15 * 60 * 1000) {
          alert("Can't delete message more than 15 minutes after sending.")
          break
        }

        newMsgObj.deleted = true
        newMsgObj.msg = "This message had been deleted."
        setopenMsgOptions(null)
        break

      case "edit":
        seteditingIndex(
          activeChatIndex +
            "-" +
            currentUserChats[activeChatIndex].messages.findIndex(
              (obj) => obj.id === msgObj.id
            )
        )

        setTimeout(() => editingInputRef.current.focus()) // immediately focus the input

        seteditingValue(msgObj.msg)
        return // no need to change the db yet

      case "reply":
        setreplyingId(msgObj.id)
        document.querySelector(".add-DM-input").focus() // focus the DM input

        // slide down the input container
        document.querySelector(".input-container.dm").style.bottom = "0"
        return // no need to change th db yet

      case "copy":
        const button = document.querySelector(".copy-btn")
        button.classList.remove("error")
        button.classList.remove("successful")

        // copy the msg to clipboard
        navigator.clipboard
          .writeText(newMsgObj.msg)
          .then(() => {
            button.classList.add("successful")
            setTimeout(() => button.classList.remove("successful"), 1200)
          })
          .catch((err) => {
            button.classList.add("error")
            setTimeout(() => button.classList.remove("error"), 1200)

            console.error("Couldn't copy.", err.message)
          })
        return // no need to change anything in the db
    }

    const newArray = [...selectedUserChats]

    // find the index of the message and set this obj to the new obj
    newArray[activeChatIndex].messages[
      newArray[activeChatIndex].messages.findIndex(
        (obj) => obj.id === newMsgObj.id
      )
    ] = newMsgObj

    setselectedUserChats(newArray)
    setcurrentUserChats(newArray)
    setactiveChat(newArray[activeChatIndex])

    putUserChats(newArray)
  }

  // keep the new input focused on change:
  useEffect(() => {
    if (editingInputRef.current) editingInputRef.current.focus()
  }, [editingValue])

  function handleApplyEdit(e, id) {
    if (e.key === "Enter") {
      const newArray = [...selectedUserChats]

      // find the index of the message and set this obj to the new obj
      newArray[activeChatIndex].messages[
        newArray[activeChatIndex].messages.findIndex((obj) => obj.id === id)
      ].msg = editingValue

      setselectedUserChats(newArray)
      setcurrentUserChats(newArray)

      putUserChats(newArray)

      seteditingIndex("")
      seteditingValue("")
    }
  }

  function handleHighlightRepliedMsg(id) {
    const msg = document.querySelector("." + id)

    msg.style.backgroundColor = "white"

    msg.style.backgroundColor = "rgb(183, 183, 183)"

    setTimeout(() => (msg.style.backgroundColor = "white"), 500)

    // scroll to the replied msg:
    const msgsContainer = document.querySelector(".msgs")
    if (msgsContainer.scrollTop >= msg.offsetTop)
      msgsContainer.scrollTop = msg.offsetTop - msgsContainer.offsetTop
  }

  function getDate(time, type) {
    const date = new Date(time)

    // get a message date
    if (type === "msg")
      return (
        date.getHours() +
        ":" +
        (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
      )

    // get a title date
    const currentDate = new Date()
    if (currentDate.getDate() === date.getDate()) return "Today"

    // logic to know if the title should be yesterday:
    const startOfDate = new Date(date)
    startOfDate.setHours(0, 0, 0, 0) // set to the start of the day
    const startOfCurrentDate = new Date(currentDate)
    startOfCurrentDate.setHours(0, 0, 0, 0) // set to the start of the day

    // check if the message was sent yesterday
    if (
      startOfDate.getTime() ===
      startOfCurrentDate.getTime() - 24 * 60 * 60 * 1000
    )
      return "Yesterday"

    // return the normal date
    return startOfDate.toDateString().replace(/\s+\S+$/, "")
  }

  function isFirstMsgOfDay(index) {
    if (index === 0) return true

    // get the dates for the current and previous messages
    const currentDate = new Date(activeChat.messages[index].date.time)
    const previousDate = new Date(activeChat.messages[index - 1].date.time)

    // check if they are on different days
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    )
  }

  async function handleSendDM(e) {
    if (e.type === "click") e.preventDefault()

    if ((e.key === "Enter" || e.type === "click") && typingMsg.trim()) {
      e.preventDefault()

      setopenMsgOptions(null) // close msg options
      document.querySelector(".input-container.dm").style.bottom = "3%" // back to normal

      const currentDate = new Date()

      const msgPushObj = {
        msg: typingMsg.trim(),
        id: uuidv4(),
        read: false,
        sender: username,
        repliedId: replyingId,
        date: {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          day: currentDate.getDate(),
          hour: currentDate.getHours(),
          minute: currentDate.getMinutes(),
          time: currentDate.getTime(),
        },
      }

      if (
        activeChatIndex === null ||
        activeChatIndex === undefined ||
        !activeChat.messages.length
      ) {
        // this means its a new chat

        // create the chat with the new message
        const newChat = { ...activeChat }

        delete newChat.came_from_add_friend // delete temp variable

        newChat.messages.push(msgPushObj)

        // post the active chat
        try {
          // create a new chat
          const postRes = await axios.post(dbApiUrl + "/chats", newChat)

          newChat._id = postRes.data.insertedId // get the chat id

          // send the message real-time
          const recipient = newChat.chatters.find(
            (chatter) => chatter !== username
          )
          const sendingChat = { ...newChat, is_new_chat: true }
          socket.emit("message", { recipient: recipient, msgObj: sendingChat })

          // set the variables:
          setactiveChat(newChat)
          setactiveChatIndex(0) // make it appear first
          const newUserChats = [newChat, ...currentUserChats]
          setcurrentUserChats(newUserChats)
          setselectedUserChats((prev) => putFirstInArray(prev, newChat))
          settypingMsg("")

          return // dont make the put request
        } catch (err) {
          alert(
            "Could not create the new chat... Please check your internet and try again later."
          )

          console.error("Couldn't create new chat.", err.message)

          return
        }
      }

      const newActiveChat = { ...activeChat }
      newActiveChat.messages.push(msgPushObj)

      setselectedUserChats((prev) => putFirstInArray(prev, newActiveChat))
      setactiveChat(newActiveChat)
      setactiveChatIndex(0) // make the chat appear first

      const newArray = putFirstInArray([...currentUserChats], newActiveChat)
      setcurrentUserChats((prev) => putFirstInArray(prev, newActiveChat))
      if (friendsTemplates)
        setfriendsTemplates((prev) => putFirstInArray(prev, newActiveChat))

      // send the message real-time
      const recipient = activeChat.chatters.find(
        (chatter) => chatter !== username
      )
      socket.emit("message", { recipient: recipient, msgObj: msgPushObj })

      putUserChats(newArray, null, newActiveChat.messages.length - 1) // the index of the new msg

      settypingMsg("")
      setreplyingId(null)

      // automatically scroll down:
      setTimeout(() => {
        const msgsContainer = document.querySelector(".msgs")
        msgsContainer.scrollTop = msgsContainer.scrollHeight
      })
    }
  }

  async function handleChangeActiveChatType(changeTo) {
    const usingArray = [...currentUserChats]

    setactiveChatType(changeTo)

    if (changeTo === "recent") setselectedUserChats(sortedByLastMsg(usingArray))
    else {
      // check if the friends templates are already initialized
      if (friendsTemplates) {
        setselectedUserChats(friendsTemplates)
        return
      }

      // initial set:

      // find the existing chats
      const existingFriendChats = usingArray.filter((chat) =>
        userData.friends.some((friend) => chat.chatters.includes(friend))
      )

      let templates = await Promise.all(
        // changed data from currentUserChats
        userData.friends.map(async (friend) => {
          try {
            const isExistingChat = usingArray.some((chat) =>
              chat.chatters.includes(friend)
            ) // find the existing chat. if it exists, return it with the friend's pfp

            if (isExistingChat) return null // existing chats will be concated afterwards

            const userFriend =
              (await axios.get(dbApiUrl + "/users/user/" + friend)) || ""

            // else, set a chat template
            return {
              chatters: [friend, username],
              messages: [],
              other_profile_pic: userFriend.data.profile_pic_url,
            }
          } catch (err) {
            // if userData not fetched, set the template with a built-in pfp
            console.error("Problem getting user's pfp.", err.message)

            return {
              chatters: [friend, username],
              messages: [],
              other_profile_pic: pfp_loader,
            }
          }
        })
      )
      templates = templates.filter((template) => template) // filter out the nulls

      templates = templates.concat(existingFriendChats)
      templates = sortedByLastMsg(templates) // sort the templates

      setselectedUserChats(templates)

      setfriendsTemplates(templates)
    }
  }

  function putUserChats(newArray, index, messageIndex) {
    const usingIndex = index || 0
    // only use index after clicking the chat

    // temporarly set a flag to dislpay the sending icon
    if (messageIndex)
      setactiveChat((prev) => {
        const newActiveChat = { ...prev }
        newActiveChat.messages[messageIndex].isSending = true
        return newActiveChat
      })

    axios
      .put(
        dbApiUrl + "/chats/" + newArray[usingIndex]._id,
        newArray[usingIndex]
      )
      .then(() => {
        // set it back to how it was
        if (messageIndex)
          setactiveChat((prev) => {
            const newActiveChat = { ...prev }
            delete newActiveChat.messages[messageIndex].isSending
            return newActiveChat
          })
      })
      .catch((err) => {
        console.error("Couldn't update chats.", err.message)
      })
  }

  // this is to reset the active chat:
  useEffect(() => {
    function handleDocumentClick(e) {
      if (
        !(
          e.target.classList.contains("current-chat") ||
          e.target.classList.contains("DM") ||
          e.target.closest(".current-chat") ||
          e.target.closest(".DM") ||
          e.target.closest(".msg-menu-btn") ||
          e.target.closest(".msg-options") ||
          e.target.closest(".cancel-reply-btn") ||
          e.target.closest(".user-option-container") ||
          e.target.closest(".ticket.not-mine")
        )
      ) {
        // dont pre set to null if nothing is active
        if (
          document
            .querySelector(".DM-slide")
            .classList.contains("double-active")
        )
          setTimeout(() => {
            setactiveChat(null)
            setactiveChatIndex(null)
          }, 701)

        document.querySelector(".DM-slide").classList.remove("double-active")
      }
    }

    document.addEventListener("click", handleDocumentClick)

    return () => {
      document.removeEventListener("click", handleDocumentClick)
    }
  }, [])

  // this is to avoid creating another chat if the chatters already have one:
  useEffect(() => {
    if (
      (activeChatIndex === null || activeChatIndex === undefined) &&
      activeChat &&
      activeChat.came_from_add_friend
    ) {
      document.querySelector(".add-DM-input").focus() // focus the input init

      const existingChatIndex = selectedUserChats.findIndex(
        (chat) =>
          chat.chatters.includes(activeChat.chatters[0]) &&
          chat.chatters.includes(activeChat.chatters[1])
      )

      if (existingChatIndex !== -1) {
        setactiveChat(selectedUserChats[existingChatIndex])
        setactiveChatIndex(existingChatIndex)
      }
    }
  }, [activeChatIndex])

  return (
    <div className="DM-slide">
      {activeChat && (
        <div className="current-chat">
          <div className="other-user-title-container">
            <img
              src={
                activeChat.other_profile_pic ||
                (friendsTemplates &&
                  friendsTemplates.find((chat) =>
                    chat.chatters.includes(
                      activeChat.chatters.find(
                        (chatter) => chatter !== username
                      )
                    )
                  ).other_profile_pic) ||
                defaultPFP
              }
              className="DMs-profile-pic"
            />
            <h2>
              {
                activeChat.chatters[
                  activeChat.chatters.findIndex((str) => str !== username)
                ]
              }
            </h2>
          </div>
          <div className="msgs">
            {activeChat.messages.map((obj, index) => {
              return (
                <div
                  key={uuidv4()}
                  style={
                    index + 1 < activeChat.messages.length &&
                    activeChat.messages[index + 1].sender === obj.sender
                      ? { margin: "0" }
                      : {}
                  }
                >
                  {isFirstMsgOfDay(index) && (
                    <div className="date-title">
                      <h3>{getDate(obj.date.time, "date title")}</h3>
                    </div>
                  )}
                  <div
                    className={
                      "msg-container " +
                      (obj.sender === username ? "my-msg " : "") +
                      (obj.repliedId ? "replied " : "") +
                      ((index &&
                        activeChat.messages[index - 1].sender === obj.sender) ||
                      (index + 1 < activeChat.messages.length &&
                        activeChat.messages[index + 1].sender === obj.sender)
                        ? "around-same-sender"
                        : "")
                    }
                  >
                    <div className="msg-reply">
                      {obj.repliedId && (
                        <div className="replied-msg-container">
                          <div className="styling-div"></div>
                          <p
                            className="replied-msg"
                            onClick={() =>
                              handleHighlightRepliedMsg(obj.repliedId)
                            }
                          >
                            {
                              activeChat.messages.find(
                                (msgObj) => msgObj.id === obj.repliedId
                              ).msg
                            }
                          </p>
                        </div>
                      )}
                      <div className="typed-container">
                        {!obj.deleted && (
                          <button
                            className="msg-menu-btn"
                            onClick={() =>
                              handleToggleMsgOptions(
                                index,
                                openMsgOptions === activeChatIndex + "-" + index
                              )
                            }
                          >
                            <SlOptionsVertical />
                          </button>
                        )}
                        {editingIndex === activeChatIndex + "-" + index ? (
                          <input
                            className="editing-input"
                            value={editingValue}
                            onChange={(e) => seteditingValue(e.target.value)}
                            ref={editingInputRef}
                            onKeyDown={(e) => handleApplyEdit(e, obj.id)}
                            onBlur={() => seteditingIndex("")}
                            maxLength={100}
                          />
                        ) : (
                          <div
                            className={
                              "msg " +
                              obj.id +
                              " " +
                              (obj.deleted ? "deleted " : "")
                            }
                          >
                            {!obj.deleted && (
                              <p className="msg-date">
                                {getDate(obj.date.time, "msg")}
                              </p>
                            )}
                            <p>{obj.msg}</p>
                            {!obj.deleted && activeChatIndex !== null ? (
                              obj.isSending && !obj.read ? (
                                <LuClock12 className="request-state-icon" />
                              ) : obj.read ? (
                                <IoMdDoneAll className="request-state-icon" />
                              ) : (
                                <IoMdCheckmark className="request-state-icon" />
                              )
                            ) : (
                              ""
                            )}
                          </div>
                        )}
                        {openMsgOptions === activeChatIndex + "-" + index && (
                          <div className="msg-options">
                            {obj.sender === username && (
                              <>
                                <button
                                  onClick={() =>
                                    handleMsgOptionClick("delete", obj)
                                  }
                                >
                                  <AiFillDelete />
                                </button>
                                <button
                                  onClick={() =>
                                    handleMsgOptionClick("edit", obj)
                                  }
                                >
                                  <MdModeEdit />
                                </button>
                              </>
                            )}
                            <button
                              className="reply-btn"
                              onClick={() => handleMsgOptionClick("reply", obj)}
                            >
                              <FaReply />
                            </button>
                            <button
                              className="copy-btn"
                              onClick={() => handleMsgOptionClick("copy", obj)}
                            >
                              COPY
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="input-container dm">
            {replyingId && (
              <div className="replying-container">
                <div className="reply">
                  <p className="reply-name">
                    Replying to{" "}
                    <b>
                      {
                        activeChat.chatters[
                          activeChat.chatters.findIndex(
                            (str) => str !== username
                          )
                        ]
                      }
                    </b>
                  </p>
                  <p className="reply-msg">
                    {
                      activeChat.messages.find((obj) => obj.id === replyingId)
                        .msg
                    }
                  </p>
                </div>
                <button
                  className="cancel-reply-btn"
                  onClick={() => handleSetReplyingId(null)}
                >
                  <IoMdClose />
                </button>
              </div>
            )}
            <ChatInput
              handleSendDM={handleSendDM}
              placeholder={
                "Text " +
                activeChat.chatters.find((chatter) => chatter !== username) +
                "..."
              }
              typingMsg={typingMsg}
              settypingMsg={settypingMsg}
            />
          </div>
        </div>
      )}
      <div className="chats">
        {currentUserChats && selectedUserChats ? (
          <>
            <div className="chat-search-container">
              <div>
                <input
                  value={query}
                  onChange={(e) => setquery(e.target.value)}
                  maxLength={25}
                  placeholder="Search..."
                />
                <button onClick={() => setquery("")}>
                  <IoMdClose />
                </button>
              </div>
            </div>
            <div className="kinds-container">
              <div>
                <button
                  className={activeChatType === "recent" ? "active" : ""}
                  onClick={() => handleChangeActiveChatType("recent")}
                >
                  Recent
                </button>
                <button
                  className={activeChatType === "friends" ? "active" : ""}
                  onClick={() => handleChangeActiveChatType("friends")}
                >
                  Friends
                </button>
              </div>
            </div>
            {selectedUserChats.length ? (
              <>
                {selectedUserChats
                  .filter(
                    (chat) =>
                      chat.chatters
                        .find((chatter) => chatter !== username)
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                      chat.messages
                        .at(-1)
                        .msg.toLowerCase()
                        .includes(query.toLowerCase())
                  )
                  .map((chat, index) => (
                    <div
                      key={uuidv4()}
                      className={
                        "DM " +
                        (activeChatIndex === index ? "active " : "") +
                        (index === 0 ? "first" : "")
                      }
                      onClick={() => handleChatClick(index)}
                    >
                      {chat.messages.length &&
                      !chat.messages.at(-1).read &&
                      chat.messages.at(-1).sender !== username ? (
                        <div className="not-read-dot"></div>
                      ) : (
                        ""
                      )}
                      <div className="last-msg">
                        <div className="words">
                          <p
                            className={
                              "msg " +
                              (chat.messages.length &&
                              !chat.messages.at(-1).read &&
                              chat.messages.at(-1).sender !== username
                                ? "not-read"
                                : "")
                            }
                          >
                            {chat.messages.length ? (
                              chat.messages.at(-1).msg
                            ) : (
                              <span>Message to start talking!</span>
                            )}
                          </p>
                          <em className="msg-date">
                            {chat.messages.length
                              ? timeAgo(
                                  chat.messages.at(-1).date.year,
                                  chat.messages.at(-1).date.month,
                                  chat.messages.at(-1).date.day,
                                  chat.messages.at(-1).date.hour,
                                  chat.messages.at(-1).date.minute
                                )
                              : ""}
                          </em>
                        </div>
                        <div className="chatter-title">
                          <h2>
                            {
                              chat.chatters[
                                chat.chatters.findIndex(
                                  (str) => str !== username
                                )
                              ]
                            }
                          </h2>
                          <img
                            src={
                              chat.other_profile_pic ||
                              (friendsTemplates &&
                                friendsTemplates.find((chat) =>
                                  chat.chatters.includes(
                                    activeChat.chatters.find(
                                      (chatter) => chatter !== username
                                    )
                                  )
                                ).other_profile_pic) ||
                              defaultPFP
                            }
                            className="DMs-profile-pic"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            ) : (
              <p className="chats-msg">
                {isSignedIn
                  ? "You haven't been talking to anyone! Click on a user's name to start a conversation"
                  : "Sign in to start messaging people!"}
              </p>
            )}
          </>
        ) : status === "loading" ? (
          <div className="loader7"></div>
        ) : (
          <p className="chats-msg">
            A problem loading your chats has occurred. Try again later!
          </p>
        )}
      </div>
    </div>
  )
}

export default DMs
