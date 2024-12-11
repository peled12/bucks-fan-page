import React, { useState, useContext } from "react"

import "./tradeIdeas.css"

import axios from "axios"

import TradeIdea from "../../../components/discussionsComponents/TradeIdea"

import loadingImg from "../../../images/loading_screen.png"

import { Link } from "react-router-dom"

import { v4 as uuidv4 } from "uuid"
import { Context } from "../../../App"
import { useQuery } from "react-query"
import changeCoins from "../../../functions/changeCoins"
import sleep from "../../../functions/sleep"
import refetch from "../../../functions/refetch"

const dbApiUrl = process.env.REACT_APP_API_URL

function TradeIdeas() {
  const [isSignedIn] = useContext(Context)
  const userName = useContext(Context)[2]

  const [likes, setlikes] = useState([])
  const [dislikes, setdislikes] = useState([])

  const [liked, setliked] = useState([])
  const [disliked, setdisliked] = useState([])

  const [currentTradeIdeas, setcurrentTradeIdeas] = useState(null)

  const { status: status, refetch: refetchTradeIdeas } = useQuery({
    queryKey: ["tradeIdeas"],
    refetchOnWindowFocus: false,
    queryFn: () => {
      axios
        .get(dbApiUrl + "/tradeIdeas")
        .then((res) => {
          const sortedData = sortData(res.data)

          // set variables:

          const newLiked = sortedData.map((idea) =>
            idea.likedBy.includes(userName)
          )
          setliked(newLiked)

          let newLikes = []
          sortedData.map((idea) => {
            newLikes.push(idea.likes)
          })

          setlikes(newLikes)

          const newDisliked = sortedData.map((idea) =>
            idea.dislikedBy.includes(userName)
          )
          setdisliked(newDisliked)

          let newDislikes = []
          sortedData.map((idea) => {
            newDislikes.push(idea.dislikes)
          })

          setdislikes(newDislikes)

          setcurrentTradeIdeas(sortedData)

          return sortedData
        })
        .catch((err) => {
          console.error("Failed to get trade ideas.", err.message)
        })
    },
  })

  function like(index, id) {
    if (!checkSignedIn()) return

    // handle the liked:
    const newLiked = [...liked]
    newLiked[index] = !newLiked[index]
    setliked(newLiked)

    // handle the likes:
    const newLikes = [...likes]
    if (newLiked[index]) newLikes[index]++
    else newLikes[index]--

    setlikes(newLikes)

    // remove the dislike if it existed:
    if (disliked[index]) {
      disliked[index] = false
      dislikes[index]--
    }

    patchLikesData(index, id, newLikes, "like")
  }

  function disLike(index, id) {
    if (!checkSignedIn()) return

    // handle the disliked:
    const newDisliked = [...disliked]
    newDisliked[index] = !newDisliked[index]
    setdisliked(newDisliked)

    // handle the dislikes
    const newDislikes = [...dislikes]
    if (newDisliked[index]) newDislikes[index]++
    else newDislikes[index]--
    setdislikes(newDislikes)

    // remove the like if it existed:
    if (liked[index]) {
      liked[index] = false
      likes[index]--
    }

    patchLikesData(index, id, newDislikes, "dislike")
  }

  function patchLikesData(index, id, array, type) {
    const likedBy = currentTradeIdeas[index].likedBy
    const isLikedBy = likedBy.includes(userName)
    const dislikedBy = currentTradeIdeas[index].dislikedBy
    const isDislikedBy = dislikedBy.includes(userName)

    // logic to get the new liked by array
    if (type === "like") {
      if (isLikedBy) likedBy.splice(likedBy.indexOf(userName), 1)
      else likedBy.push(userName)
    }

    // logic to get the new disliked by array
    if (type === "dislike") {
      if (isDislikedBy) dislikedBy.splice(dislikedBy.indexOf(userName), 1)
      else dislikedBy.push(userName)
    }

    // remove the like if dislike and vise versa:
    if (isLikedBy && type === "dislike")
      likedBy.splice(dislikedBy.indexOf(userName), 1)
    if (isDislikedBy && type === "like")
      dislikedBy.splice(likedBy.indexOf(userName), 1)

    // logic to get the new likes / dislikes:
    let currentLikes, currentDislikes
    if (type === "like") {
      currentLikes = array[index]
      currentDislikes = dislikes[index]
    }
    if (type === "dislike") {
      currentLikes = likes[index]
      currentDislikes = array[index]
    }

    // change the trade ideas:
    const updatedArray = [...currentTradeIdeas]
    updatedArray[index].likedBy = likedBy
    updatedArray[index].dislikedBy = dislikedBy
    updatedArray[index].likes = currentLikes
    updatedArray[index].dislikes = currentDislikes

    // start the animation
    const loader = document.querySelector(".trade-ideas-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/tradeIdeas/" + id, {
        likes: currentLikes,
        dislikes: currentDislikes,
        likedBy: likedBy,
        dislikedBy: dislikedBy,
      })
      .then(async () => {
        // update the coins of the poster:
        if (type === "like" && updatedArray[index].maker === userName) {
          if (likedBy.includes(userName))
            await changeCoins(updatedArray[index].maker, 4)
          else await changeCoins(updatedArray[index].maker, -4)
        }

        console.log("hi")

        setcurrentTradeIdeas(updatedArray) // update

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
        console.error("Failed to patch trade ideas.", err.message)

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

  function sortData(data) {
    data.sort((a, b) => b.date.time - a.date.time)

    return data
  }

  function patchCommentsData(newComments, id, newArray, type, maker) {
    // start the animation
    const loader = document.querySelector(".trade-ideas-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/tradeIdeas/" + id, {
        comments: newComments,
      })
      .then(async () => {
        // only change coins if type is set and the liker is not the maker
        if (maker !== userName) {
          if (type === "add like") await changeCoins(maker, 2)
          else if (type === "remove like") await changeCoins(maker, -2)
        }

        setcurrentTradeIdeas(newArray)

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
        console.error("Failed to patch trade ideas.", err.message)

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

  function handleAddComment(e, index, id) {
    if (e.key === "Enter" && e.target.value.trim()) {
      if (!checkSignedIn()) return

      const newComments = [...currentTradeIdeas[index].comments]

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
          time: date.getTime(),
        },
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        replies: [],
        id: uuidv4(),
      })

      const newTradeIdeas = [...currentTradeIdeas]
      newTradeIdeas[index].comments = newComments

      setcurrentTradeIdeas(newTradeIdeas)

      patchCommentsData(newComments, id, newTradeIdeas)

      e.target.value = "" // clear the box
    }
  }

  function handleRemoveComment(index, commentIndex, id) {
    const newArray = [...currentTradeIdeas]

    newArray[index].comments.splice(commentIndex, 1)

    setcurrentTradeIdeas(newArray)

    const newComments = newArray[index].comments

    patchCommentsData(newComments, id, newArray)
  }

  function handleLikeComment(index, commentIndex, id) {
    const loader = document.querySelector(".trade-ideas-loader")

    // dont allow requests while adding coins
    if (loader.style.display === "block") return

    const newComment = currentTradeIdeas[index].comments[commentIndex]

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

    const newArray = [...currentTradeIdeas]

    newArray[index].comments[commentIndex] = newComment

    setcurrentTradeIdeas(newArray)

    const newComments = newArray[index].comments

    patchCommentsData(
      newComments,
      id,
      newArray,
      !newComments[commentIndex].likedBy.includes(userName)
        ? "remove like"
        : "add like",
      newComment.maker
    )
  }

  function handleDislikeComment(index, commentIndex, id) {
    const newComment = currentTradeIdeas[index].comments[commentIndex]

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

    const newArray = [...currentTradeIdeas]

    newArray[index].comments[commentIndex] = newComment

    const newComments = newArray[index].comments

    patchCommentsData(newComments, id, newArray)
  }

  function deleteIdea(id) {
    // update currentTradeIdeas:
    const newArray = [...currentTradeIdeas]
    const updatedArray = newArray.filter(
      (idea) => JSON.stringify(idea._id) !== JSON.stringify(id)
    )
    setcurrentTradeIdeas(updatedArray)

    // start the animation
    const loader = document.querySelector(".trade-ideas-loader")
    loader.style.display = "block"

    // update in the db:
    axios
      .delete(dbApiUrl + "/tradeIdeas/" + id)
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
        console.error("Failed to delete trade idea.", err.message)

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

  function handleAddReply(e, index, commentIndex, id, replyTo) {
    if (e.key === "Enter" && e.target.value.trim()) {
      if (!checkSignedIn()) return

      const newReplies = [
        ...currentTradeIdeas[index].comments[commentIndex].replies,
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
          time: date.getTime(),
        },
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
      })

      const newTradeIdeas = [...currentTradeIdeas]
      newTradeIdeas[index].comments[commentIndex].replies = newReplies

      const newComments = newTradeIdeas[index].comments

      patchCommentsData(newComments, id, newTradeIdeas)

      e.target.value = "" // clear the box
    }
  }

  function handleRemoveReply(index, commentIndex, replyIndex, id) {
    const newArray = [...currentTradeIdeas]

    newArray[index].comments[commentIndex].replies.splice(replyIndex, 1)

    const newComments = newArray[index].comments

    patchCommentsData(newComments, id, newArray)
  }

  function handleLikeReply(index, commentIndex, replyIndex, id) {
    if (!checkSignedIn()) return

    const loader = document.querySelector(".trade-ideas-loader")

    // dont allow requests while adding coins
    if (loader.style.display === "block") return

    const newReply =
      currentTradeIdeas[index].comments[commentIndex].replies[replyIndex]

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

    const newArray = [...currentTradeIdeas]

    newArray[index].comments[commentIndex].replies[replyIndex] = newReply

    const newComments = newArray[index].comments

    patchCommentsData(
      newComments,
      id,
      newArray,
      !newComments[commentIndex].replies[replyIndex].likedBy.includes(userName)
        ? "remove like"
        : "add like",
      newReply.maker
    )
  }

  function handleDislikeReply(index, commentIndex, replyIndex, id) {
    if (!checkSignedIn()) return

    const newReply =
      currentTradeIdeas[index].comments[commentIndex].replies[replyIndex]

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

    const newArray = [...currentTradeIdeas]

    newArray[index].comments[commentIndex].replies[replyIndex] = newReply

    const newComments = newArray[index].comments

    patchCommentsData(newComments, id, newArray)
  }

  function checkSignedIn() {
    if (!isSignedIn) {
      alert("You must be signed in.")
    }

    return isSignedIn
  }

  return (
    <>
      <h1 className="page-title">Trade Ideas</h1>
      <div className="post-trade-idea-request">
        <div className="loader4 trade-ideas-loader"></div>
        {isSignedIn ? (
          <p>
            Wanna post your own trade idea?{" "}
            <Link to="/PostTradeIdea">Click Here!</Link>
          </p>
        ) : (
          <p>
            Wanna post your trade idea? <Link to="/SignIn">Click Here</Link> to
            sign in!
          </p>
        )}
      </div>
      <div className="loader4 trade-ideas-loader"></div>
      <button
        className="refetch-btn"
        onClick={() =>
          refetch(
            refetchTradeIdeas,
            document.querySelector(".trade-ideas-loader")
          )
        }
      >
        Refetch
      </button>
      {currentTradeIdeas ? (
        <>
          {currentTradeIdeas.length ? (
            <p className="trade-ideas-most-recent-msg">Most Recent</p>
          ) : (
            <p className="no-trade-ideas-msg">
              No trade ideas are available. <br />{" "}
              <Link to="/PostTradeIdea">Click here</Link> to post the first one!
            </p>
          )}
          {currentTradeIdeas.map((tradeIdea, index) => (
            <TradeIdea
              key={tradeIdea._id}
              index={index}
              tradeIdea={tradeIdea}
              isFirst={index === 0}
              like={() => like(index, tradeIdea._id)}
              dislike={() => disLike(index, tradeIdea._id)}
              liked={liked[index]}
              disliked={disliked[index]}
              handleAddComment={handleAddComment}
              handleRemoveComment={handleRemoveComment}
              handleLikeComment={handleLikeComment}
              handleDislikeComment={handleDislikeComment}
              deleteIdea={deleteIdea}
              handleAddReply={handleAddReply}
              handleRemoveReply={handleRemoveReply}
              handleLikeReply={handleLikeReply}
              handleDislikeReply={handleDislikeReply}
            />
          ))}
        </>
      ) : (
        <div className="loading-container">
          <img src={loadingImg} />
          {status === "error" ? (
            <p>It looks like we have a problem. try again later!</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}
    </>
  )
}

export default TradeIdeas
